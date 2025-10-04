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
}

module.exports = new TopupRequestRepository();
