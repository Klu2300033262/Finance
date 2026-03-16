import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['income', 'expense'],
      message: 'Transaction type must be either income or expense'
    }
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringTransaction',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for user and date
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ user: 1, category: 1 });

// Virtual for formatted date
transactionSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Static method to get user transactions with filters
transactionSchema.statics.getUserTransactions = function(userId, filters = {}) {
  const query = { user: userId, ...filters };
  return this.find(query).sort({ date: -1, createdAt: -1 });
};

// Static method for dashboard analytics
transactionSchema.statics.getDashboardData = async function(userId, startDate, endDate) {
  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ];

  const typeTotals = await this.aggregate(pipeline);
  
  const incomeResult = typeTotals.find(t => t._id === 'income') || { total: 0, count: 0 };
  const expenseResult = typeTotals.find(t => t._id === 'expense') || { total: 0, count: 0 };

  // Get category breakdown for expenses
  const categoryPipeline = [
    { $match: { ...matchStage, type: 'expense' } },
    {
      $group: {
        _id: '$category',
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { amount: -1 } }
  ];

  const categoryExpenses = await this.aggregate(categoryPipeline);

  // Get daily data
  const dailyPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
        },
        expenses: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const dailyData = await this.aggregate(dailyPipeline);

  // Get recent transactions
  const recentTransactions = await this.find(matchStage)
    .sort({ date: -1, createdAt: -1 })
    .limit(10)
    .populate('user', 'email');

  return {
    totalIncome: incomeResult.total,
    totalExpenses: expenseResult.total,
    balance: incomeResult.total - expenseResult.total,
    savingsRate: incomeResult.total > 0 ? ((incomeResult.total - expenseResult.total) / incomeResult.total) * 100 : 0,
    incomeCount: incomeResult.count,
    expenseCount: expenseResult.count,
    categoryExpenses: categoryExpenses.map(cat => ({
      category: cat._id,
      amount: cat.amount,
      count: cat.count
    })),
    dailyData: dailyData.map(day => ({
      date: day._id,
      income: day.income,
      expenses: day.expenses
    })),
    recentTransactions
  };
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
