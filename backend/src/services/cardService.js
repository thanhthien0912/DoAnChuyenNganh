const crypto = require('crypto');
const cardRepository = require('../repositories/cardRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

const ALLOWED_STATUS = ['ACTIVE', 'LOCKED'];

class CardService {
  async listUserCards(userId) {
    return cardRepository.find({ userId }, { sort: { isPrimary: -1, linkedAt: -1 } });
  }

  async linkCard(userId, { uid, alias, metadata, makePrimary = false }) {
    try {
      const normalizedUid = uid.toUpperCase();

      const existingCard = await cardRepository.findByUid(normalizedUid);
      if (existingCard) {
        if (existingCard.userId.toString() !== userId.toString()) {
          throw new Error('Thẻ NFC này đã được liên kết với tài khoản khác');
        }
        throw new Error('Thẻ NFC đã được liên kết với tài khoản của bạn');
      }

      const cardDocument = cardRepository.createDocument({
        userId,
        uid: normalizedUid,
        alias: alias?.trim() || '',
        metadata,
        isPrimary: false,
        status: 'ACTIVE'
      });

      await cardRepository.save(cardDocument);

      const userCards = await cardRepository.find({ userId });
      const shouldSetPrimary = makePrimary || userCards.length === 1;

      if (shouldSetPrimary) {
        await cardRepository.setPrimaryCard(userId, cardDocument._id);
        cardDocument.isPrimary = true;
      }

      logger.info(`Card linked for user ${userId}: ${normalizedUid}`);

      return cardDocument;
    } catch (error) {
      logger.error('Link card error:', error.message);
      throw error;
    }
  }

  async updateStatus(userId, cardId, status) {
    try {
      const normalizedStatus = status.toUpperCase();
      if (!ALLOWED_STATUS.includes(normalizedStatus)) {
        throw new Error('Trạng thái thẻ không hợp lệ');
      }

      const card = await cardRepository.findOne({ _id: cardId, userId });
      if (!card) {
        throw new Error('Không tìm thấy thẻ NFC');
      }

      card.status = normalizedStatus;
      if (normalizedStatus !== 'ACTIVE' && card.isPrimary) {
        card.isPrimary = false;
      }

      await cardRepository.save(card);

      return card;
    } catch (error) {
      logger.error('Update card status error:', error.message);
      throw error;
    }
  }

  async setPrimary(userId, cardId) {
    try {
      const card = await cardRepository.findOne({ _id: cardId, userId });
      if (!card) {
        throw new Error('Không tìm thấy thẻ NFC');
      }

      if (card.status !== 'ACTIVE') {
        throw new Error('Chỉ có thể đặt thẻ đang hoạt động làm thẻ chính');
      }

      await cardRepository.setPrimaryCard(userId, cardId);

      return cardRepository.findById(cardId);
    } catch (error) {
      logger.error('Set primary card error:', error.message);
      throw error;
    }
  }

  async generateCardWriteData(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      const studentId = user.studentId;
      const fullName = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
      const timestamp = Date.now();
      const cardId = `CARD-${userId.toString().slice(-8)}-${timestamp}`;

      // Generate signature: HMAC-SHA256(studentId + fullName + cardId)
      const dataToSign = `${studentId}|${fullName}|${cardId}`;
      const signature = crypto
        .createHmac('sha256', process.env.NFC_SECURITY_KEY || 'default_nfc_key')
        .update(dataToSign)
        .digest('hex')
        .substring(0, 16); // Use first 16 characters for shorter signature

      // Format: STUDENT_CARD|MSSV|FullName|CardID|Signature
      const writeData = `STUDENT_CARD|${studentId}|${fullName}|${cardId}|${signature}`;

      logger.info(`Generated card write data for user ${userId}`);

      return {
        writeData,
        studentId,
        fullName,
        cardId,
        signature,
        instructions: [
          'Chạm thẻ NFC vào điện thoại',
          'Dữ liệu sẽ được ghi tự động',
          'Thẻ có thể dùng để thanh toán sau khi liên kết'
        ]
      };
    } catch (error) {
      logger.error('Generate card write data error:', error.message);
      throw error;
    }
  }

  verifyCardData(writeData) {
    try {
      const parts = writeData.split('|');
      if (parts.length !== 5 || parts[0] !== 'STUDENT_CARD') {
        throw new Error('Dữ liệu thẻ không hợp lệ');
      }

      const [, studentId, fullName, cardId, signature] = parts;

      // Verify signature
      const dataToSign = `${studentId}|${fullName}|${cardId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.NFC_SECURITY_KEY || 'default_nfc_key')
        .update(dataToSign)
        .digest('hex')
        .substring(0, 16);

      if (signature !== expectedSignature) {
        throw new Error('Chữ ký thẻ không hợp lệ');
      }

      return {
        valid: true,
        studentId,
        fullName,
        cardId
      };
    } catch (error) {
      logger.error('Verify card data error:', error.message);
      throw error;
    }
  }
}

module.exports = new CardService();
