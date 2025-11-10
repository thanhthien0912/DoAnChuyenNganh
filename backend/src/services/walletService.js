const walletRepository = require('../repositories/walletRepository');
const transactionRepository = require('../repositories/transactionRepository');
const topupRequestRepository = require('../repositories/topupRequestRepository');
const cardRepository = require('../repositories/cardRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');
const { formatTransaction, formatTopupRequest, toPlainNumber } = require('../utils/formatters');

class WalletService {
  async getHomeSummary(userId) {
    try {
      const [user, wallet] = await Promise.all([
        userRepository.findById(userId, { select: 'studentId email profile' }),
        walletRepository.findOne({ userId, isActive: true })
      ]);

      if (!user) {
        throw new Error('User not found');
      }

      if (!wallet) {
        throw new Error('Active wallet not found');
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const [cards, recentTransactions, todaySpendStats] = await Promise.all([
        cardRepository.find({ userId }, { sort: { isPrimary: -1, linkedAt: -1 } }),
        transactionRepository.getRecentTransactionsByUser(userId, 3, {
          populate: {
            path: 'walletId',
            select: 'currency'
          }
        }),
        transactionRepository.getUserSpendInRange(userId, startOfDay, endOfDay, ['PAYMENT'])
      ]);

      const dailyLimit = toPlainNumber(wallet.dailyLimit);
      const monthlyLimit = toPlainNumber(wallet.monthlyLimit);
      const dailySpent = toPlainNumber(wallet.dailySpent);
      const monthlySpent = toPlainNumber(wallet.monthlySpent);
      const balance = toPlainNumber(wallet.balance);

      const primaryCard = cards.find(card => card.isPrimary) || cards[0] || null;
      const cardStatusLabel = primaryCard
        ? (primaryCard.status === 'ACTIVE' ? 'Đã liên kết' : 'Đang khóa')
        : 'Chưa liên kết';

      const profile = (user.profile && typeof user.profile === 'object') ? user.profile : {};

      return {
        user: {
          id: user._id,
          studentId: user.studentId,
          fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
          email: user.email
        },
        wallet: {
          id: wallet._id,
          balance,
          currency: wallet.currency,
          dailyLimit,
          monthlyLimit,
          dailySpent,
          monthlySpent
        },
        cards: {
          total: cards.length,
          statusLabel: cardStatusLabel,
          primary: primaryCard ? {
            id: primaryCard._id,
            uid: primaryCard.uid,
            alias: primaryCard.alias,
            status: primaryCard.status,
            isPrimary: primaryCard.isPrimary,
            isLocked: primaryCard.isLocked || false,
            lockedAt: primaryCard.lockedAt,
            statusLabel: cardStatusLabel
          } : null,
          list: cards.map(card => ({
            id: card._id,
            uid: card.uid,
            alias: card.alias,
            status: card.status,
            isPrimary: card.isPrimary,
            statusLabel: card.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa',
            linkedAt: card.linkedAt,
            lastUsedAt: card.lastUsedAt
          }))
        },
        quickActions: [
          { key: 'TOPUP', label: 'Nạp tiền', route: '/topup' },
          { key: 'POS', label: 'POS', route: '/pos' },
          { key: 'NFC', label: 'Ghi thẻ', route: '/write-card' },
          { key: 'HISTORY', label: 'Lịch sử', route: '/transactions' }
        ],
        stats: {
          spentToday: toPlainNumber(todaySpendStats.total),
          dailyRemaining: Math.max(dailyLimit - dailySpent, 0),
          monthlyRemaining: Math.max(monthlyLimit - monthlySpent, 0)
        },
        recentTransactions: recentTransactions.map(tx => {
          const formatted = formatTransaction(tx);
          return { ...formatted, currency: formatted.currency || wallet.currency };
        })
      };
    } catch (error) {
      logger.error('Get home summary error:', error.message);
      throw error;
    }
  }

  async requestTopup(userId, amount, method = 'MANUAL', note) {
    try {
      const normalizedAmount = Number(amount);
      if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
        throw new Error('Invalid top-up amount');
      }

      const wallet = await walletRepository.findOne({ userId, isActive: true });
      if (!wallet) {
        throw new Error('Active wallet not found');
      }

      const topupRequest = topupRequestRepository.createDocument({
        userId,
        walletId: wallet._id,
        amount: normalizedAmount,
        method: method ? method.toUpperCase() : 'MANUAL',
        note,
        status: 'PENDING'
      });

      await topupRequestRepository.save(topupRequest);

      logger.info(`Top-up request created: ${topupRequest.referenceNumber} - ${normalizedAmount} VND`);

      return formatTopupRequest(topupRequest, { currency: wallet.currency });
    } catch (error) {
      logger.error('Top-up request error:', error.message);
      throw error;
    }
  }

  async getTopupRequests(userId, { page = 1, limit = 20, status } = {}) {
    try {
      const [result, wallet] = await Promise.all([
        topupRequestRepository.getUserRequests(userId, { page, limit, status }),
        walletRepository.findOne({ userId, isActive: true }, { select: 'currency' })
      ]);

      const walletCurrency = wallet?.currency || 'VND';

      return {
        requests: result.requests.map(request => formatTopupRequest(request, { currency: walletCurrency })),
        pagination: result.pagination
      };
    } catch (error) {
      logger.error('Get top-up requests error:', error.message);
      throw error;
    }
  }
}

module.exports = new WalletService();
