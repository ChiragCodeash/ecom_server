const { body } = require("express-validator");
const db = require("../../db/db");

const LoginValidation = [
    body("email")
    .notEmpty()
    .withMessage("Please provide your email to proceed.")
    .isEmail()
    .withMessage("Please provide valid email."),
    body("password")
    .notEmpty()
    .withMessage("Please provide password to proceed.")
    
];
const RegistrationValidation = [
  body("name")
    .notEmpty()
    .withMessage("Please provide your name to proceed.")
    .isLength({ min: 3 })
    .withMessage("Please enter a name with at least 3 characters.")
    .isLength({ max: 15 })
    .withMessage("Please enter a name with fewer than 15 characters.")
    .matches(/[^0-9]/)
    .withMessage("Please enter a valid name with letters."),
  body("email")
    .notEmpty()
    .withMessage("Please provide your email to proceed.")
    .isEmail()
    .withMessage("Please provide valid email.")
    .custom(async (value, { req }) => {
      const [data] = await db.query("SELECT * FROM user WHERE email = ? ", [
        value,
      ]);
      if (data.length) {
        throw new Error("This email is already in use.");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Please provide password to proceed.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character."
    ),
];

module.exports = {
  LoginValidation,
  RegistrationValidation,
};
