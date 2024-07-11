const { body, param } = require("express-validator");
const db = require("../../db/db");
const CLIENT_RECORD_PER_PAGE = process.env.CLIENT_RECORD_PER_PAGE;

const GetFilterValidation = [
  body("pc_ids")
    .optional()
    .isArray()
    .withMessage("pc_ids is must be in array")
    .isArray({ min: 1 })
    .withMessage("pc_ids array is must be not empty"),
  body("pc_ids.*")
    .isNumeric()
    .withMessage("Please provide all pc_id in number")
    .custom(async (value, { req }) => {
      const [data] = await db.query(
        "SELECT * FROM tblproductcategory WHERE pc_id = ? ",
        [value]
      );
      if (!data.length) {
        throw new Error(`${value} is an invalid pc_id`);
      }
      return true;
    }),
];

const GetProductsValidation = [
  body("page")
    .notEmpty()
    .withMessage("page is  required")
    .isInt({ min: 1 })
    .withMessage("page must be in number")
    .default(1)
    .toInt(),
  body("per_page")
    .default(CLIENT_RECORD_PER_PAGE)
    .optional()
    .notEmpty()
    .withMessage("per_page is required")
    .isInt({ min: 1 })
    .withMessage("per_page must be in number"),

  // .toInt(),
  body("query")
    .optional({ values: "falsy" })
    .notEmpty()
    .withMessage("query is  required")
    .isString()
    .withMessage("query must be in string")
    .trim(),
  body("pc_ids")
    // .optional()
    .isArray()
    .withMessage("pc_ids is must be in array"),
  // .isArray({ min: 1 })
  // .withMessage("pc_ids array is must be not empty"),
  body("pc_ids.*")
    // .optional()
    .isNumeric()
    .withMessage("Please provide all pc_id in number")
    .custom(async (value, { req }) => {
      const [data] = await db.query(
        "SELECT * FROM tblproductcategory WHERE pc_id = ? ",
        [value]
      );
      if (!data.length) {
        throw new Error(`${value} is an invalid pc_id`);
      }
      return true;
    }),
  body("color_ids")
    // .optional({ values: "falsy" })
    .isArray()
    .withMessage("color_ids is must be in array"),
  // .isArray({ min: 1 })
  // .withMessage("color_ids array is must be not empty"),
  body("color_ids.*")
    // .optional()
    .isNumeric()
    .withMessage("Please provide all color_ids in number")
    .custom(async (value, { req }) => {
      const [data] = await db.query(
        "SELECT * FROM tblcolor WHERE color_id = ? ",
        [value]
      );
      if (!data.length) {
        throw new Error(`${value} is an invalid color_id`);
      }
      return true;
    }),
  body("size_ids")
    // .optional({ values: "falsy" })
    .isArray()
    .withMessage("size_ids is must be in array"),
  // .isArray({ min: 1 })
  // .withMessage("size_ids array is must be not empty"),
  body("size_ids.*")
    // .optional()
    .isNumeric()
    .withMessage("Please provide all size_ids in number")
    .custom(async (value, { req }) => {
      const [data] = await db.query(
        "SELECT * FROM tblsize WHERE size_id = ? ",
        [value]
      );
      if (!data.length) {
        throw new Error(`${value} is an invalid size_id`);
      }
      return true;
    }),
  body("price_range")
    // .optional({ values: "falsy" })
    .isArray()
    .withMessage("price_range is must be in array"),
    // .isArray({ min: 2, max: 2 })
    // .withMessage("price_range array must be containe two elements")
  body("sorting")
    .optional({ values: "falsy" })
    .isIn([
      "ALPHA_ASC",
      "ALPHA_DESC",
      "PRICE_ASC",
      "PRICE_DESC",
      "DATE_ASC",
      "DATE_DESC",
    ])
    .withMessage(
      "sorting must be from ALPHA_ASC,ALPHA_DESC,PRICE_ASC,PRICE_DESC,DATE_ASC,DATE_DESC"
    ),
];

const GetSingleProduct = [
  param("variant_id")
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
];

module.exports = {
  GetFilterValidation,
  GetProductsValidation,
  GetSingleProduct,
};
