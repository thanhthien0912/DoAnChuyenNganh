const logger = require('../utils/logger');

const isPinVerified = (req) => {
  if (req.headers['x-pin-verified']) {
    return String(req.headers['x-pin-verified']).toLowerCase() === 'true';
  }

  if (req.headers['x-security-verified']) {
    return String(req.headers['x-security-verified']).toLowerCase() === 'true';
  }

  if (typeof req.body?.pinVerified === 'boolean') {
    return req.body.pinVerified;
  }

  if (typeof req.body?.securityVerified === 'boolean') {
    return req.body.securityVerified;
  }

  return false;
};

const requirePinConfirmation = (req, res, next) => {
  if (isPinVerified(req)) {
    return next();
  }

  logger.warn('PIN/2FA confirmation missing for sensitive action');

  return res.status(403).json({
    success: false,
    error: {
      code: 'PIN_VERIFICATION_REQUIRED',
      message: 'Vui lòng xác thực PIN hoặc mã 2FA trước khi thực hiện hành động này.'
    }
  });
};

module.exports = {
  requirePinConfirmation
};
