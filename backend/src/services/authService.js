const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const walletRepository = require('../repositories/walletRepository');
const tokenRepository = require('../repositories/tokenRepository');
const logger = require('../utils/logger');

class AuthService {
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Generate JWT tokens
  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
  }

  // Register new user
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await userRepository.findByEmailOrStudentId({
        email: userData.email,
        studentId: userData.studentId
      });

      if (existingUser) {
        throw new Error('User with this email or student ID already exists');
      }

      // Create new user
      const user = userRepository.createDocument(userData);
      await userRepository.save(user);

      // Create wallet for the user
      const wallet = walletRepository.createDocument({
        userId: user._id,
        balance: 0,
        currency: 'VND',
        dailyLimit: 10000000, // 10 million VND
        monthlyLimit: 100000000 // 100 million VND
      });
      await walletRepository.save(wallet);

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Update user's last login
      user.lastLogin = new Date();
      await userRepository.save(user);

      logger.info(`New user registered: ${user.studentId}`);

      return {
        user: {
          id: user._id,
          studentId: user.studentId,
          email: user.email,
          role: user.role,
          profile: user.profile,
          isActive: user.isActive
        },
        tokens,
        wallet: {
          id: wallet._id,
          balance: wallet.balance,
          currency: wallet.currency,
          dailyLimit: wallet.dailyLimit,
          monthlyLimit: wallet.monthlyLimit
        }
      };
    } catch (error) {
      logger.error('Registration error:', error.message);
      throw error;
    }
  }

  // Login user
  async login(login, password) {
    try {
      // Find user by email or studentId (include password for comparison)
      const user = await userRepository.findByLoginIdentifier(login, {
        select: '+password'
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid credentials or account is inactive');
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Get user's wallet
      const wallet = await walletRepository.findOne({ userId: user._id });

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Update user's last login
      user.lastLogin = new Date();
      await userRepository.save(user);

      logger.info(`User logged in: ${user.studentId}`);

      return {
        user: {
          id: user._id,
          studentId: user.studentId,
          email: user.email,
          role: user.role,
          profile: user.profile,
          isActive: user.isActive
        },
        tokens,
        wallet: {
          id: wallet._id,
          balance: wallet.balance,
          currency: wallet.currency,
          dailyLimit: wallet.dailyLimit,
          monthlyLimit: wallet.monthlyLimit
        }
      };
    } catch (error) {
      logger.error('Login error:', error.message);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      const tokenHash = this.hashToken(refreshToken);
      const isRevoked = await tokenRepository.isTokenBlacklisted(tokenHash);
      if (isRevoked) {
        throw new Error('Refresh token has been revoked');
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.id);

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      const newTokens = this.generateTokens(user);

      await tokenRepository.blacklistToken({
        tokenHash,
        userId: user._id,
        type: 'refresh',
        expiresAt: new Date(decoded.exp * 1000)
      });

      return newTokens;
    } catch (error) {
      logger.error('Token refresh error:', error.message);
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await userRepository.findById(userId);
      const wallet = await walletRepository.findOne({ userId });

      return {
        user: {
          id: user._id,
          studentId: user.studentId,
          email: user.email,
          role: user.role,
          profile: user.profile,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        },
        wallet: {
          id: wallet._id,
          balance: wallet.balance,
          currency: wallet.currency,
          dailyLimit: wallet.dailyLimit,
          monthlyLimit: wallet.monthlyLimit,
          dailySpent: wallet.dailySpent,
          monthlySpent: wallet.monthlySpent
        }
      };
    } catch (error) {
      logger.error('Get profile error:', error.message);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const user = await userRepository.updateById(
        userId,
        { $set: { profile: profileData } }
      );

      logger.info(`User profile updated: ${user.studentId}`);
      return user;
    } catch (error) {
      logger.error('Update profile error:', error.message);
      throw error;
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await userRepository.findById(userId, { select: '+password' });

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await userRepository.save(user);

      logger.info(`Password changed for user: ${user.studentId}`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error.message);
      throw error;
    }
  }

  // Logout user (invalidate token)
  // Logout user (invalidate token)
  async logout(userId, accessToken, accessPayload, refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      const user = await userRepository.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const refreshTokenHash = this.hashToken(refreshToken);
      const isRefreshRevoked = await tokenRepository.isTokenBlacklisted(refreshTokenHash);
      if (isRefreshRevoked) {
        throw new Error('Refresh token has been revoked');
      }

      let refreshDecoded;
      try {
        refreshDecoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      } catch (error) {
        throw new Error('Invalid refresh token');
      }

      if (String(refreshDecoded.id) !== String(userId)) {
        throw new Error('Invalid refresh token');
      }

      const operations = [];

      if (accessToken) {
        const payload = accessPayload || jwt.verify(accessToken, process.env.JWT_SECRET);
        operations.push(
          tokenRepository.blacklistToken({
            tokenHash: this.hashToken(accessToken),
            userId,
            type: 'access',
            expiresAt: new Date(payload.exp * 1000)
          })
        );
      }

      operations.push(
        tokenRepository.blacklistToken({
          tokenHash: refreshTokenHash,
          userId,
          type: 'refresh',
          expiresAt: new Date(refreshDecoded.exp * 1000)
        })
      );

      await Promise.all(operations);

      logger.info(`User logged out: ${user.studentId}`);
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error.message);
      throw error;
    }
  }
  async getAllUsers(page = 1, limit = 20) {
    try {
      return userRepository.getUsers({
        page,
        limit,
        options: {
          select: '-password'
        }
      });
    } catch (error) {
      logger.error('Get all users error:', error.message);
      throw error;
    }
  }

  // Admin: Get user by ID
  async getUserById(userId) {
    try {
      return userRepository.findById(userId);
    } catch (error) {
      logger.error('Get user by ID error:', error.message);
      throw error;
    }
  }

  // Admin: Update user by ID
  async updateUser(userId, updateData) {
    try {
      return userRepository.updateById(userId, updateData);
    } catch (error) {
      logger.error('Update user error:', error.message);
      throw error;
    }
  }

  // Admin: Deactivate user by ID
  async deactivateUser(userId) {
    try {
      return userRepository.deactivateUser(userId);
    } catch (error) {
      logger.error('Deactivate user error:', error.message);
      throw error;
    }
  }
}

module.exports = new AuthService();