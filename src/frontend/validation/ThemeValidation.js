const { body } = require("express-validator");

const updateThemeValidation = [
  body("theme_obj", "Theme Object is required").notEmpty(),
];

module.exports = {
  updateThemeValidation,
};
