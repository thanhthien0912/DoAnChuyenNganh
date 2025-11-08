const POSCategory = require('../models/POSCategory');
const POSItem = require('../models/POSItem');
const FavoriteTransaction = require('../models/FavoriteTransaction');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class POSController {
  // Get all POS categories
  async getCategories(req, res) {
    try {
      const categories = await POSCategory.find({ isActive: true })
        .sort({ displayOrder: 1, name: 1 })
        .select('-__v');

      res.json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      logger.error('Get POS categories error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_CATEGORIES_ERROR',
          message: error.message
        }
      });
    }
  }

  // Get items by category
  async getItemsByCategory(req, res) {
    try {
      const { categoryKey } = req.params;

      const items = await POSItem.find({
        categoryKey: categoryKey.toUpperCase(),
        isAvailable: true
      })
        .sort({ displayOrder: 1, name: 1 })
        .select('-__v');

      res.json({
        success: true,
        data: { items }
      });
    } catch (error) {
      logger.error('Get POS items error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_ITEMS_ERROR',
          message: error.message
        }
      });
    }
  }

  // Process POS transaction
  async processTransaction(req, res) {
    try {
      const { itemId, quantity, categoryKey, nfcData } = req.body;
      const userId = req.user._id;

      logger.info('POS Transaction Request:', {
        itemId,
        quantity,
        categoryKey,
        nfcData,
        userId: userId.toString()
      });

      // Validate item
      const item = await POSItem.findById(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      if (!item.isAvailable) {
        throw new Error('Item is not available');
      }

      // Calculate total amount
      const totalAmount = parseFloat(item.price) * quantity;

      // Get user's wallet
      const wallet = await Wallet.findOne({ userId, isActive: true });
      if (!wallet) {
        throw new Error('Active wallet not found');
      }

      // Check balance
      const currentBalance = parseFloat(wallet.balance);
      if (currentBalance < totalAmount) {
        throw new Error('Insufficient balance');
      }

      // Generate reference number
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const referenceNumber = `POS${timestamp}${random}`;

      // Create transaction
      const transaction = new Transaction({
        userId,
        walletId: wallet._id,
        type: 'PAYMENT',
        amount: totalAmount,
        status: 'COMPLETED',
        description: `${item.name} x${quantity}`,
        referenceNumber,
        nfcData,
        metadata: {
          category: categoryKey.toUpperCase(),
          merchantName: item.name,
          notes: `POS Transaction - ${item.name} (${quantity})`
        },
        processedAt: new Date()
      });

      // Update wallet balance
      wallet.balance = (currentBalance - totalAmount).toFixed(2);

      // Update daily and monthly spent
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      if (wallet.lastTransactionDate) {
        const lastTxDate = new Date(wallet.lastTransactionDate);
        
        if (lastTxDate < todayStart) {
          wallet.dailySpent = totalAmount;
        } else {
          wallet.dailySpent = (parseFloat(wallet.dailySpent) + totalAmount).toFixed(2);
        }

        if (lastTxDate < monthStart) {
          wallet.monthlySpent = totalAmount;
        } else {
          wallet.monthlySpent = (parseFloat(wallet.monthlySpent) + totalAmount).toFixed(2);
        }
      } else {
        wallet.dailySpent = totalAmount;
        wallet.monthlySpent = totalAmount;
      }

      wallet.lastTransactionDate = now;

      // Save transaction first, then wallet
      await transaction.save();
      await wallet.save();

      logger.info(`POS transaction processed: ${transaction.referenceNumber} - ${totalAmount} VND`);

      res.json({
        success: true,
        message: 'Transaction processed successfully',
        data: {
          transaction: {
            referenceNumber: transaction.referenceNumber,
            type: transaction.type,
            amount: parseFloat(transaction.amount),
            description: transaction.description,
            status: transaction.status,
            createdAt: transaction.createdAt
          },
          wallet: {
            balance: parseFloat(wallet.balance),
            currency: wallet.currency
          }
        }
      });
    } catch (error) {
      logger.error('POS transaction error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(400).json({
        success: false,
        error: {
          code: 'POS_TRANSACTION_ERROR',
          message: error.message
        }
      });
    }
  }

  // Get favorite transactions
  async getFavorites(req, res) {
    try {
      const userId = req.user._id;

      const favorites = await FavoriteTransaction.find({ userId })
        .populate('itemId', 'name price categoryKey image')
        .sort({ createdAt: -1 })
        .select('-__v');

      res.json({
        success: true,
        data: { favorites }
      });
    } catch (error) {
      logger.error('Get favorite transactions error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_FAVORITES_ERROR',
          message: error.message
        }
      });
    }
  }

  // Add favorite transaction
  async addFavorite(req, res) {
    try {
      const { name, categoryKey, itemId, quantity, totalAmount } = req.body;
      const userId = req.user._id;

      // Check if item exists
      const item = await POSItem.findById(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      const favorite = new FavoriteTransaction({
        userId,
        name,
        categoryKey: categoryKey.toUpperCase(),
        itemId,
        quantity,
        totalAmount
      });

      await favorite.save();

      const populatedFavorite = await FavoriteTransaction.findById(favorite._id)
        .populate('itemId', 'name price categoryKey image');

      logger.info(`Favorite transaction added: ${favorite._id}`);

      res.json({
        success: true,
        message: 'Favorite transaction added successfully',
        data: { favorite: populatedFavorite }
      });
    } catch (error) {
      logger.error('Add favorite transaction error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'ADD_FAVORITE_ERROR',
          message: error.message
        }
      });
    }
  }

  // Delete favorite transaction
  async deleteFavorite(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const favorite = await FavoriteTransaction.findOneAndDelete({
        _id: id,
        userId
      });

      if (!favorite) {
        throw new Error('Favorite transaction not found');
      }

      logger.info(`Favorite transaction deleted: ${id}`);

      res.json({
        success: true,
        message: 'Favorite transaction deleted successfully'
      });
    } catch (error) {
      logger.error('Delete favorite transaction error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_FAVORITE_ERROR',
          message: error.message
        }
      });
    }
  }
}

module.exports = new POSController();
