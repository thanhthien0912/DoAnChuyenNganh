const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmailOrStudentId({ email, studentId }, options = {}) {
    const conditions = [];

    if (email) {
      conditions.push({ email });
    }

    if (studentId) {
      conditions.push({ studentId });
    }

    if (!conditions.length) {
      return null;
    }

    return this.findOne({ $or: conditions }, options);
  }

  findByLoginIdentifier(identifier, options = {}) {
    return this.findOne({
      $or: [
        { email: identifier },
        { studentId: identifier }
      ]
    }, options);
  }

  async getUsers({ page = 1, limit = 20, filter = {}, options = {} }) {
    const skip = (page - 1) * limit;

    const users = await this.find(filter, {
      ...options,
      skip,
      limit,
      sort: options.sort || { createdAt: -1 }
    });

    const total = await this.countDocuments(filter);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  deactivateUser(id) {
    return this.updateById(id, { isActive: false });
  }

  async deleteUser(id) {
    const Wallet = require('../models/Wallet');
    const Transaction = require('../models/Transaction');
    const TopupRequest = require('../models/TopupRequest');
    const Token = require('../models/Token');

    // Delete all related data
    await Promise.all([
      Wallet.deleteMany({ userId: id }),
      Transaction.deleteMany({ userId: id }),
      TopupRequest.deleteMany({ userId: id }),
      Token.deleteMany({ userId: id })
    ]);

    // Delete user
    return this.deleteById(id);
  }
}

module.exports = new UserRepository();
