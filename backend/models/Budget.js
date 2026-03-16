import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0.01, 'Budget amount must be greater than 0']
  },
  period: {
    type: String,
    required: [true, 'Budget period is required'],
    enum: {
      values: ['weekly', 'monthly', 'yearly'],
      message: 'Period must be weekly, monthly, or yearly'
    },
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: function() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    default: function() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  alertThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 80 // Alert when 80% of budget is used
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for user and category
budgetSchema.index({ user: 1, category: 1 });
budgetSchema.index({ user: 1, isActive: 1 });
budgetSchema.index({ user: 1, period: 1 });

// Virtual for spent amount
budgetSchema.virtual('spent').get(function() {
  // This will be populated by the controller
  return this._spent || 0;
});

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function() {
  return this.amount - this.spent;
});

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function() {
  return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
});

// Virtual for status
budgetSchema.virtual('status').get(function() {
  const percentage = this.percentageUsed;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= this.alertThreshold) return 'warning';
  if (percentage >= 50) return 'caution';
  return 'good';
});

// Static method to get user budgets with spending
budgetSchema.statics.getUserBudgetsWithSpending = async function(userId, period = 'monthly') {
  try {
    const budgets = await this.find({ 
      user: new mongoose.Types.ObjectId(userId), 
      period, 
      isActive: true 
    }).sort({ category: 1 });

  // Calculate spending for each budget
  for (const budget of budgets) {
    const spent = await mongoose.model('Transaction').aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
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
  }

  return budgets;
  } catch (error) {
    console.error('Error in getUserBudgetsWithSpending:', error);
    return [];
  }
};

// Static method to get budget alerts
budgetSchema.statics.getBudgetAlerts = async function(userId) {
  const budgets = await this.getUserBudgetsWithSpending(userId);
  
  return budgets.filter(budget => {
    const percentage = (budget.spent / budget.amount) * 100;
    return percentage >= budget.alertThreshold;
  }).map(budget => ({
    category: budget.category,
    spent: budget.spent,
    amount: budget.amount,
    percentage: (budget.spent / budget.amount) * 100,
    status: budget.status
  }));
};

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
