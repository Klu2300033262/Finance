import mongoose from 'mongoose';

const recurringTransactionSchema = new mongoose.Schema({
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
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: {
      values: ['daily', 'weekly', 'monthly', 'yearly'],
      message: 'Frequency must be daily, weekly, monthly, or yearly'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  lastGenerated: {
    type: Date,
    default: null
  },
  nextDue: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for user and active status
recurringTransactionSchema.index({ user: 1, isActive: 1 });
recurringTransactionSchema.index({ user: 1, nextDue: 1 });

// Virtual for formatted next due date
recurringTransactionSchema.virtual('formattedNextDue').get(function() {
  return this.nextDue.toISOString().split('T')[0];
});

// Static method to get user's recurring transactions
recurringTransactionSchema.statics.getUserRecurringTransactions = function(userId, filters = {}) {
  const query = { user: userId, ...filters };
  return this.find(query).sort({ nextDue: 1, createdAt: -1 });
};

// Static method to get due transactions
recurringTransactionSchema.statics.getDueTransactions = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    nextDue: { $lte: now }
  }).sort({ nextDue: 1 });
};

// Instance method to calculate next due date
recurringTransactionSchema.methods.calculateNextDue = function() {
  const current = new Date(this.nextDue);
  
  switch (this.frequency) {
    case 'daily':
      current.setDate(current.getDate() + 1);
      break;
    case 'weekly':
      current.setDate(current.getDate() + 7);
      break;
    case 'monthly':
      current.setMonth(current.getMonth() + 1);
      break;
    case 'yearly':
      current.setFullYear(current.getFullYear() + 1);
      break;
  }
  
  return current;
};

// Instance method to update next due date
recurringTransactionSchema.methods.updateNextDue = function() {
  this.lastGenerated = new Date(this.nextDue);
  this.nextDue = this.calculateNextDue();
  
  // Check if we've reached the end date
  if (this.endDate && this.nextDue > this.endDate) {
    this.isActive = false;
  }
  
  return this.save();
};

const RecurringTransaction = mongoose.model('RecurringTransaction', recurringTransactionSchema);

export default RecurringTransaction;
