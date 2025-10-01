const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const tokenRepository = require('../repositories/tokenRepository');
const logger = require('../utils/logger');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const roleMatches = (requiredRole, userRole) => {
  if (!requiredRole || !userRole) {
    return false;
  }

  if (requiredRole === 'user') {
    return userRole === 'user' || userRole === 'student';
  }

  return requiredRole === userRole;
};

// JWT Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') ||
                  req.query.token ||
                  req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No token provided.'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isRevoked = await tokenRepository.isTokenBlacklisted(hashToken(token));
    if (isRevoked) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REVOKED',
          message: 'Token has been revoked.'
        }
      });
    }

    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token or user account is inactive.'
        }
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    req.authPayload = { ...decoded, role: user.role };

    logger.info(`User ${user.studentId} authenticated successfully`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token.'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token expired.'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed.'
      }
    });
  }
};

// Role-based Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentication required.'
        }
      });
    }

    if (roles.length && !roles.some((role) => roleMatches(role, req.user.role))) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Access denied. Insufficient permissions.'
        }
      });
    }

    next();
  };
};

// Admin-only middleware
const adminOnly = authorize('admin');
const managerOnly = authorize('manager');
const userOnly = authorize('user');

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') ||
                  req.query.token ||
                  req.cookies.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      const isRevoked = await tokenRepository.isTokenBlacklisted(hashToken(token));

      if (user && user.isActive && !isRevoked) {
        req.user = user;
        req.token = token;
        req.authPayload = { ...decoded, role: user.role };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Token refresh middleware
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required.'
        }
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const isRevoked = await tokenRepository.isTokenBlacklisted(hashToken(refreshToken));
    if (isRevoked) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_REVOKED',
          message: 'Refresh token has been revoked.'
        }
      });
    }
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid refresh token.'
        }
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    req.newAccessToken = accessToken;
    next();
  } catch (error) {
    logger.error('Token refresh error:', error.message);
    return res.status(401).json({
      success: false,
      error: {
        code: 'REFRESH_TOKEN_EXPIRED',
        message: 'Refresh token expired or invalid.'
      }
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  adminOnly,
  managerOnly,
  userOnly,
  optionalAuth,
  refreshToken
};