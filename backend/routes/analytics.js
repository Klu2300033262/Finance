import express from 'express';
import validator from 'validator';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import RecurringTransaction from '../models/RecurringTransaction.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate'
      });
    }

    if (!validator.isISO8601(startDate) || !validator.isISO8601(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid dates in ISO8601 format'
      });
    }

    const dashboardData = await Transaction.getDashboardData(
      req.user._id,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/analytics/summary
// @desc    Get financial summary
router.get('/summary', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const dashboardData = await Transaction.getDashboardData(
      req.user._id,
      startDate.toISOString(),
      endDate.toISOString()
    );

    // Add budget information
    const budgets = await Budget.getUserBudgetsWithSpending(req.user._id, period);
    const budgetAlerts = await Budget.getBudgetAlerts(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        ...dashboardData,
        budgets,
        budgetAlerts,
        period
      }
    });
  } catch (error) {
    console.error('Summary analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get spending/income trends
router.get('/trends', async (req, res) => {
  try {
    const { period = 'monthly', months = 12 } = req.query;

    const monthsCount = Math.min(24, Math.max(1, parseInt(months)));
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsCount + 1, 1);

    const pipeline = [
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$amount', 0]
            }
          },
          incomeCount: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$count', 0]
            }
          },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$count', 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: 1
            }
          },
          income: 1,
          expenses: 1,
          incomeCount: 1,
          expenseCount: 1,
          balance: { $subtract: ['$income', '$expenses'] }
        }
      },
      { $sort: { date: 1 } }
    ];

    const trends = await Transaction.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: { trends }
    });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/analytics/categories
// @desc    Get category breakdown
router.get('/categories', async (req, res) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate'
      });
    }

    const pipeline = [
      {
        $match: {
          user: req.user._id,
          type,
          date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $addFields: {
          percentage: {
            $multiply: [
              {
                $divide: [
                  '$amount',
                  {
                    $sum: '$amount'
                  }
                ]
              },
              100
            ]
          }
        }
      },
      { $sort: { amount: -1 } }
    ];

    const categories = await Transaction.aggregate(pipeline);

    // Calculate total for percentage calculation
    const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
    
    // Recalculate percentages correctly
    const categoriesWithPercentage = categories.map(cat => ({
      ...cat,
      percentage: total > 0 ? (cat.amount / total) * 100 : 0
    }));

    res.status(200).json({
      success: true,
      data: { categories: categoriesWithPercentage }
    });
  } catch (error) {
    console.error('Categories analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/analytics/comparison
// @desc    Compare periods
router.get('/comparison', async (req, res) => {
  try {
    const { currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd } = req.query;

    if (!currentPeriodStart || !currentPeriodEnd || !previousPeriodStart || !previousPeriodEnd) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all period dates'
      });
    }

    const currentData = await Transaction.getDashboardData(
      req.user._id,
      currentPeriodStart,
      currentPeriodEnd
    );

    const previousData = await Transaction.getDashboardData(
      req.user._id,
      previousPeriodStart,
      previousPeriodEnd
    );

    // Calculate changes
    const comparison = {
      income: {
        current: currentData.totalIncome,
        previous: previousData.totalIncome,
        change: currentData.totalIncome - previousData.totalIncome,
        changePercentage: previousData.totalIncome > 0 
          ? ((currentData.totalIncome - previousData.totalIncome) / previousData.totalIncome) * 100 
          : 0
      },
      expenses: {
        current: currentData.totalExpenses,
        previous: previousData.totalExpenses,
        change: currentData.totalExpenses - previousData.totalExpenses,
        changePercentage: previousData.totalExpenses > 0 
          ? ((currentData.totalExpenses - previousData.totalExpenses) / previousData.totalExpenses) * 100 
          : 0
      },
      balance: {
        current: currentData.balance,
        previous: previousData.balance,
        change: currentData.balance - previousData.balance,
        changePercentage: previousData.balance !== 0 
          ? ((currentData.balance - previousData.balance) / Math.abs(previousData.balance)) * 100 
          : 0
      },
      savingsRate: {
        current: currentData.savingsRate,
        previous: previousData.savingsRate,
        change: currentData.savingsRate - previousData.savingsRate
      }
    };

    res.status(200).json({
      success: true,
      data: {
        currentPeriod: { start: currentPeriodStart, end: currentPeriodEnd },
        previousPeriod: { start: previousPeriodStart, end: previousPeriodEnd },
        comparison,
        currentData,
        previousData
      }
    });
  } catch (error) {
    console.error('Comparison analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
