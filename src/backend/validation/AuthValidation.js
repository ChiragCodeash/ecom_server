const { body } = require("express-validator");

const registerValidation = [
  body("uname", "Username is required").notEmpty(),
  body("uname", "You can not add only number in Username").matches(/[a-zA-Z]/),
  body("email", "email address is required").notEmpty(),
  body("email", "Please enter a valid email address").isEmail(),
  body("password", "password is required").notEmpty(),
  body("cpassword", "Confirm password is required").notEmpty(),
  body("password", "password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "password length is minimum 8 characters and it includes at least one capital letter, one small letter, one digit and one special characters."
    ),
  body().custom((value, { req }) => {
    const password = value.password;
    const cpassword = value.cpassword;
    if (password !== cpassword) {
      throw new Error(
        "password and confirm password do not match. Please enter again"
      );
    }
    return true;
  }),
];

const loginValidation = [
  body("email", "email is required").notEmpty(),
  body("email", "Please enter valid email address").isEmail(),
  body("password", "password is required").notEmpty(),
];

module.exports = {
  registerValidation,
  loginValidation
};
