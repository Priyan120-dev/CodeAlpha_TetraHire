const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/customError');

// Middleware to verify JWT Access Token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Access token is missing. Please log in first.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return next(error);
  }
};

// Middleware to restrict access based on user role(s)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access Denied: Your role '${req.user ? req.user.role : 'Guest'}' is not authorized for this resource.`
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
