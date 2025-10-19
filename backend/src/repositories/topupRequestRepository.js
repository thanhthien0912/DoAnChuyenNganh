const BaseRepository = require('./BaseRepository');
const TopupRequest = require('../models/TopupRequest');

class TopupRequestRepository extends BaseRepository {
  constructor() {
    super(TopupRequest);
  }

  async getUserRequests(userId, { page = 1, limit = 20, status } = {}) {
    const filter = { userId };
    if (status) {
      filter.status = status.toUpperCase();
    }

    const skip = (page - 1) * limit;
    const requests = await this.find(filter, {
      skip,
      limit,
      sort: { createdAt: -1 }
    });

    const total = await this.countDocuments(filter);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  async getAllRequests({ status, userId, startDate, endDate, page = 1, limit = 20 } = {}) {
    const filter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (userId) {
      filter.userId = userId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;
    const requests = await this.find(filter, {
      skip,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'userId', select: 'studentId email profile' },
        { path: 'processedBy', select: 'studentId profile.firstName profile.lastName' }
      ]
    });

    const total = await this.countDocuments(filter);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  async getPendingCount() {
    return this.countDocuments({ status: 'PENDING' });
  }
}

module.exports = new TopupRequestRepository();
