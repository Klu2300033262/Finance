import express from 'express';
import validator from 'validator';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/transactions
// @desc    Get user transactions with optional filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sort = 'date',
      order = 'desc'
    } = req.query;

    // Build filters
    const filters = { user: req.user._id };
    
    if (type && ['income', 'expense'].includes(type)) {
      filters.type = type;
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // Build sort
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
router.post('/', async (req, res) => {
  try {
    const {
      amount,
      description,
      category,
      type,
      date,
      tags
    } = req.body;

    // Validation
    if (!amount || !description || !category || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, description, category, and type'
      });
    }

    if (!validator.isNumeric(amount.toString()) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either income or expense'
      });
    }

    if (date && !validator.isISO8601(date)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      amount: parseFloat(amount),
      description: description.trim(),
      category: category.trim(),
      type,
      date: date ? new Date(date) : new Date(),
      tags: tags ? tags.map(tag => tag.trim()).filter(tag => tag) : []
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
router.put('/:id', async (req, res) => {
  try {
    const {
      amount,
      description,
      category,
      type,
      date,
      tags
    } = req.body;

    // Find transaction
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
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
    
    if (description !== undefined) {
      updateData.description = description.trim();
    }
    
    if (category !== undefined) {
      updateData.category = category.trim();
    }
    
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either income or expense'
        });
      }
      updateData.type = type;
    }
    
    if (date !== undefined) {
      if (!validator.isISO8601(date)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date'
        });
      }
      updateData.date = new Date(date);
    }
    
    if (tags !== undefined) {
      updateData.tags = tags.map(tag => tag.trim()).filter(tag => tag);
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction: updatedTransaction }
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/transactions/categories
// @desc    Get user's transaction categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Transaction.distinct('category', {
      user: req.user._id
    });

    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
