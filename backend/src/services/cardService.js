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
      
      // Debug log
      logger.info(`Link card attempt - UID: ${normalizedUid}, Length: ${normalizedUid.length}, UserId: ${userId}`);
      logger.info(`Link card data - alias: ${alias}, metadata: ${JSON.stringify(metadata)}, makePrimary: ${makePrimary}`);

      const existingCard = await cardRepository.findByUid(normalizedUid);
      if (existingCard) {
        logger.info(`Existing card found - UID: ${normalizedUid}, CardUserId: ${existingCard.userId}, CurrentUserId: ${userId}, isLocked: ${existingCard.isLocked}`);
        
        if (existingCard.userId.toString() === userId.toString()) {
          // Same user: Allow updating existing card (re-write) even if locked
          // User owns this card, they can update it anytime
          existingCard.alias = alias?.trim() || existingCard.alias;
          existingCard.metadata = metadata || existingCard.metadata;
          existingCard.linkedAt = new Date(); // Update linked time
          await cardRepository.save(existingCard);
          logger.info(`Card updated for user ${userId}: ${normalizedUid}, isLocked: ${existingCard.isLocked}`);
          return existingCard;
        } else {
          // Different user - Check if locked
          logger.error(`Card conflict - UID: ${normalizedUid} belongs to userId: ${existingCard.userId}, attempted by userId: ${userId}`);
          
          if (existingCard.isLocked) {
            throw new Error('Thẻ này đã được khóa bởi người dùng khác');
          }
          throw new Error('Thẻ này đang được sử dụng bởi người dùng khác');
        }
      }

      const cardDocument = cardRepository.createDocument({
        userId,
        uid: normalizedUid,
        alias: alias?.trim() || '',
        metadata,
        isPrimary: false,
        status: 'ACTIVE',
        isLocked: false,
        lockedAt: null
      });

      logger.info('Saving card document:', {
        userId: cardDocument.userId,
        uid: cardDocument.uid,
        alias: cardDocument.alias,
        status: cardDocument.status,
        isLocked: cardDocument.isLocked
      });
      
      await cardRepository.save(cardDocument);
      
      logger.info('Card saved successfully');

      const userCards = await cardRepository.find({ userId });
      const shouldSetPrimary = makePrimary || userCards.length === 1;

      if (shouldSetPrimary) {
        await cardRepository.setPrimaryCard(userId, cardDocument._id);
        cardDocument.isPrimary = true;
      }

      logger.info(`Card linked for user ${userId}: ${normalizedUid}`);

      return cardDocument;
    } catch (error) {
      // Detailed error logging
      if (error.name === 'ValidationError') {
        logger.error('Mongoose validation error:', {
          message: error.message,
          errors: error.errors,
          name: error.name
        });
      } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        logger.error('MongoDB error:', {
          message: error.message,
          code: error.code,
          name: error.name
        });
      } else {
        logger.error('Link card error:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
          toString: error.toString()
        });
      }
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

  async getUserByCardUid(uid) {
    try {
      const normalizedUid = uid.toUpperCase();
      const card = await cardRepository.findByUid(normalizedUid);
      
      if (!card) {
        throw new Error('Thẻ NFC không tồn tại trong hệ thống');
      }

      if (card.status !== 'ACTIVE') {
        throw new Error('Thẻ NFC không ở trạng thái hoạt động');
      }

      // Update last used timestamp
      card.lastUsedAt = new Date();
      await cardRepository.save(card);

      logger.info(`Card used for payment: ${normalizedUid} by user ${card.userId}`);

      return card.userId;
    } catch (error) {
      logger.error('Get user by card UID error:', error.message);
      throw error;
    }
  }

  async toggleCardLock(userId, cardId, lock, password) {
    try {
      logger.info('toggleCardLock service - userId:', userId, 'cardId:', cardId, 'lock:', lock);
      
      const card = await cardRepository.findOne({ _id: cardId, userId });
      if (!card) {
        logger.error('Card not found - cardId:', cardId, 'userId:', userId);
        throw new Error('Không tìm thấy thẻ');
      }

      logger.info('Card found:', card.uid);

      // Verify password - must explicitly select password field
      const user = await userRepository.findById(userId, { select: '+password' });
      if (!user) {
        logger.error('User not found - userId:', userId);
        throw new Error('Không tìm thấy người dùng');
      }

      logger.info('User found, verifying password...');
      
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        logger.error('Invalid password for user:', userId);
        throw new Error('Mật khẩu không chính xác');
      }

      logger.info('Password valid, updating card lock status...');

      card.isLocked = lock;
      card.lockedAt = lock ? new Date() : null;
      await cardRepository.save(card);

      logger.info(`Card ${lock ? 'locked' : 'unlocked'}: ${card.uid} by user ${userId}`);

      return card;
    } catch (error) {
      logger.error('Toggle card lock service error:', {
        message: error.message,
        stack: error.stack,
        userId,
        cardId
      });
      throw error;
    }
  }

  async deleteCard(userId, cardId, password) {
    try {
      const card = await cardRepository.findOne({ _id: cardId, userId });
      if (!card) {
        throw new Error('Không tìm thấy thẻ');
      }

      // Verify password - must explicitly select password field
      const user = await userRepository.findById(userId, { select: '+password' });
      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Mật khẩu không chính xác');
      }

      // Delete the card
      await cardRepository.deleteById(cardId);

      logger.info(`Card deleted: ${card.uid} by user ${userId}`);

      return { success: true, uid: card.uid };
    } catch (error) {
      logger.error('Delete card error:', error.message);
      throw error;
    }
  }

  // Admin methods
  async getAllCards({ page = 1, limit = 50, search, status, isLocked } = {}) {
    try {
      const query = {};

      // Search by UID, alias, or populate user's studentId
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { uid: searchRegex },
          { alias: searchRegex }
        ];
      }

      if (status) {
        query.status = status.toUpperCase();
      }

      if (typeof isLocked === 'boolean') {
        query.isLocked = isLocked;
      }

      const skip = (page - 1) * limit;
      const [cards, total] = await Promise.all([
        cardRepository.find(query, {
          skip,
          limit,
          sort: { linkedAt: -1 },
          populate: {
            path: 'userId',
            select: 'studentId email profile.firstName profile.lastName'
          }
        }),
        cardRepository.countDocuments(query)
      ]);

      const formattedCards = cards.map(card => ({
        id: card._id,
        uid: card.uid,
        alias: card.alias,
        status: card.status,
        isPrimary: card.isPrimary,
        isLocked: card.isLocked,
        linkedAt: card.linkedAt,
        lastUsedAt: card.lastUsedAt,
        lockedAt: card.lockedAt,
        user: card.userId ? {
          id: card.userId._id,
          studentId: card.userId.studentId,
          email: card.userId.email,
          fullName: `${card.userId.profile?.firstName || ''} ${card.userId.profile?.lastName || ''}`.trim()
        } : null
      }));

      return {
        cards: formattedCards,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get all cards error:', error.message);
      throw error;
    }
  }

  async adminDeleteCard(cardId) {
    try {
      const card = await cardRepository.findById(cardId);
      if (!card) {
        throw new Error('Không tìm thấy thẻ');
      }

      await cardRepository.deleteById(cardId);

      logger.info(`Card deleted by admin: ${card.uid}`);

      return { success: true, uid: card.uid };
    } catch (error) {
      logger.error('Admin delete card error:', error.message);
      throw error;
    }
  }

  async adminUnlockCard(cardId) {
    try {
      const card = await cardRepository.findById(cardId);
      if (!card) {
        throw new Error('Không tìm thấy thẻ');
      }

      card.isLocked = false;
      card.lockedAt = null;
      await cardRepository.save(card);

      logger.info(`Card unlocked by admin: ${card.uid}`);

      return card;
    } catch (error) {
      logger.error('Admin unlock card error:', error.message);
      throw error;
    }
  }
}

module.exports = new CardService();
