import express from 'express';
import validator from 'validator';
import Budget from '../models/Budget.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/budgets
// @desc    Get user budgets with spending information
router.get('/', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    const budgets = await Budget.getUserBudgetsWithSpending(req.user._id, period);

    res.status(200).json({
      success: true,
      data: { budgets }
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/budgets/alerts
// @desc    Get budget alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Budget.getBudgetAlerts(req.user._id);

    res.status(200).json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error('Get budget alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/budgets/:id
// @desc    Get single budget
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Calculate spending for this budget
    const Transaction = (await import('../models/Transaction.js')).default;
    const spent = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          category: budget.category,
          type: 'expense',
          date: { $gte: budget.startDate, $lte: budget.endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    budget._spent = spent.length > 0 ? spent[0].total : 0;

    res.status(200).json({
      success: true,
      data: { budget }
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/budgets
// @desc    Create new budget
router.post('/', async (req, res) => {
  try {
    const {
      category,
      amount,
      period = 'monthly',
      startDate,
      endDate,
      alertThreshold = 80
    } = req.body;

    // Validation
    if (!category || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category and amount'
      });
    }

    if (!validator.isNumeric(amount.toString()) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    if (!['weekly', 'monthly', 'yearly'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Period must be weekly, monthly, or yearly'
      });
    }

    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category: category.trim(),
      period,
      isActive: true
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: `Budget already exists for ${category} in ${period} period`
      });
    }

    // Create budget with auto-generated dates if not provided
    const now = new Date();
    let budgetStartDate = startDate ? new Date(startDate) : now;
    let budgetEndDate = endDate ? new Date(endDate) : now;

    // Auto-generate dates based on period
    if (!startDate || !endDate) {
      if (period === 'monthly') {
        budgetStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        budgetEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === 'weekly') {
        const dayOfWeek = now.getDay();
        budgetStartDate = new Date(now.setDate(now.getDate() - dayOfWeek));
        budgetEndDate = new Date(now.setDate(now.getDate() - dayOfWeek + 6));
      } else if (period === 'yearly') {
        budgetStartDate = new Date(now.getFullYear(), 0, 1);
        budgetEndDate = new Date(now.getFullYear(), 11, 31);
      }
    }

    const budget = await Budget.create({
      user: req.user._id,
      category: category.trim(),
      amount: parseFloat(amount),
      period,
      startDate: budgetStartDate,
      endDate: budgetEndDate,
      alertThreshold: Math.min(100, Math.max(0, parseInt(alertThreshold))),
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { budget }
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update budget
router.put('/:id', async (req, res) => {
  try {
    const {
      amount,
      period,
      startDate,
      endDate,
      alertThreshold,
      isActive
    } = req.body;

    // Find budget
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Build update data
    const updateData = {};
    
    if (amount !== undefined) {
      if (!validator.isNumeric(amount.toString()) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
      }
      updateData.amount = parseFloat(amount);
    }
    
    if (period !== undefined) {
      if (!['weekly', 'monthly', 'yearly'].includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Period must be weekly, monthly, or yearly'
        });
      }
      updateData.period = period;
    }
    
    if (startDate !== undefined) {
      updateData.startDate = new Date(startDate);
    }
    
    if (endDate !== undefined) {
      updateData.endDate = new Date(endDate);
    }
    
    if (alertThreshold !== undefined) {
      updateData.alertThreshold = Math.min(100, Math.max(0, parseInt(alertThreshold)));
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: { budget: updatedBudget }
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
      data: { budget }
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
