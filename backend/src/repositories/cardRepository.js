const BaseRepository = require('./BaseRepository');
const Card = require('../models/Card');

class CardRepository extends BaseRepository {
  constructor() {
    super(Card);
  }

  findByUid(uid) {
    return this.findOne({ uid: uid.toUpperCase() });
  }

  async setPrimaryCard(userId, cardId) {
    await Card.updateMany({ userId }, { $set: { isPrimary: false } });
    return this.updateById(cardId, { isPrimary: true });
  }
}

module.exports = new CardRepository();
