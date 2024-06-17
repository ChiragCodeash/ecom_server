const { validationResult } = require("express-validator");

const expressValidationErrorHandler = (req, res , next) => {
  const errors = validationResult(req);
  // console.log(errors)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      // errors,
      message: errors.errors.map((error) => {
        return error.msg;
      })[0],
    });
  }
  next()
};

module.exports = expressValidationErrorHandler