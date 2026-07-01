const { validationResult } = require('express-validator');

// Validation runner to format and bubble up express-validator check errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => `${err.path}: ${err.msg}`).join(', ');
    const error = new Error(errorMessages);
    error.statusCode = 400;
    return next(error);
  }
  next();
};

module.exports = validate;
