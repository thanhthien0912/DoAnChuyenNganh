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
}

module.exports = new UserRepository();
