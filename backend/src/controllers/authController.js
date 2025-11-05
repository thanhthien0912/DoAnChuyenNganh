const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      logger.error('Registration error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: error.message
        }
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { login, password } = req.body;
      const result = await authService.login(login, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      logger.error('Login error:', error.message);
      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message: error.message
        }
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const result = await authService.getProfile(req.user._id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get profile error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'PROFILE_ERROR',
          message: error.message
        }
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const result = await authService.updateProfile(req.user._id, req.body.profile);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: result
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_PROFILE_ERROR',
          message: error.message
        }
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user._id, currentPassword, newPassword);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Change password error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'CHANGE_PASSWORD_ERROR',
          message: error.message
        }
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token is required'
          }
        });
      }
      const newTokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: {
          tokens: newTokens
        }
      });
    } catch (error) {
      logger.error('Refresh token error:', error.message);
      res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_ERROR',
          message: error.message
        }
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token is required'
          }
        });
      }

      await authService.logout(req.user._id, req.token, req.authPayload, refreshToken);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error.message);
      const statusMap = {
        'Refresh token is required': 400,
        'Invalid refresh token': 401,
        'Refresh token has been revoked': 401
      };
      const statusCode = statusMap[error.message] || 500;
      res.status(statusCode).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Create new user
  async createUser(req, res) {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result
      });
    } catch (error) {
      logger.error('Create user error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'CREATE_USER_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Get all users
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await authService.getAllUsers(page, limit);

      res.json({
        success: true,
        data: {
          users: result.users,
          pagination: result.pagination
        }
      });
    } catch (error) {
      logger.error('Get all users error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USERS_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Get user by ID
  async getUserById(req, res) {
    try {
      const user = await authService.getUserById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      res.json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      logger.error('Get user by ID error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USER_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Update user
  async updateUser(req, res) {
    try {
      const user = await authService.updateUser(req.params.id, req.body);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: {
          user
        }
      });
    } catch (error) {
      logger.error('Update user error:', error.message);
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_USER_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Deactivate user (soft delete - set isActive to false)
  async deactivateUser(req, res) {
    try {
      const user = await authService.deactivateUser(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: {
          user
        }
      });
    } catch (error) {
      logger.error('Deactivate user error:', error.message);
      res.status(500).json({
        success: false,
        error: {
          code: 'DEACTIVATE_USER_ERROR',
          message: error.message
        }
      });
    }
  }

  // Admin: Delete user permanently (hard delete with cascade)
  async deleteUser(req, res) {
    try {
      const result = await authService.deleteUser(req.params.id);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Delete user error:', error.message);
      const statusCode = error.message === 'User not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: {
          code: 'DELETE_USER_ERROR',
          message: error.message
        }
      });
    }
  }
}

module.exports = new AuthController();