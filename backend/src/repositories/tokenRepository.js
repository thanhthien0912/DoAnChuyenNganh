const BaseRepository = require('./BaseRepository');
const Token = require('../models/Token');

class TokenRepository extends BaseRepository {
  constructor() {
    super(Token);
  }

  blacklistToken({ tokenHash, userId, type, expiresAt }) {
    return this.updateOne(
      { tokenHash },
      {
        $set: {
          user: userId,
          type,
          expiresAt,
          blacklisted: true
        }
      },
      { upsert: true }
    );
  }

  async isTokenBlacklisted(tokenHash) {
    const token = await this.findOne({ tokenHash, blacklisted: true });
    return Boolean(token);
  }
}

module.exports = new TokenRepository();
