const BaseRepository = require('./BaseRepository');
const Wallet = require('../models/Wallet');

class WalletRepository extends BaseRepository {
  constructor() {
    super(Wallet);
  }

  findByUserId(userId, options = {}) {
    return this.findOne({ userId }, options);
  }

  getActiveWallets() {
    return Wallet.getActiveWallets();
  }

  getWalletStats() {
    return Wallet.getWalletStats();
  }
}

module.exports = new WalletRepository();
