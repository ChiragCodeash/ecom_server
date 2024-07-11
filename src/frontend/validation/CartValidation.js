const { body } = require("express-validator");
const db = require("../../db/db");

const AddToCartValidation = [
  body("variant_id")
    .notEmpty()
    .withMessage("variant_id is required")
    .isNumeric()
    .withMessage("Please provide varinat_id in number")
    .custom(async (value, { req }) => {
      const [data] = await db.query(
        "SELECT * FROM tblvariant WHERE variant_id = ? ",
        [value]
      );
      if (!data.length) {
        throw new Error(`${value} is an invalid variant_id`);
      }
      return true;
    }),
  body("qty")
    .notEmpty()
    .withMessage("qty is required")
    .isNumeric()
    .withMessage("Please provide qty in number")
    .isInt({ max: 5, min: 1 })
    .withMessage("qty is must be in 1 to 5"),
];

module.exports = { AddToCartValidation };
