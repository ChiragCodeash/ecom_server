const {
  body,
  query,
  oneOf,
  checkSchema,
  validationResult,
} = require("express-validator");
const db = require("../../db/db");

const ideal_for = ["male", "female", "kids"];
const required_list = [
  "sale_price",
  "price",
  "stock",
  "variant_status",
  "sku_id",
];

const CreateProductValidation = [
  body("pc_id", "pc_id is required").notEmpty(),
  body("product_title", "product_title is required").notEmpty(),
  body("product_title", "product title can not containe only number").matches(
    /[^0-9]/
  ),
  body("product_desc", "product_desc is required").notEmpty(),
  body("pack_of", "Number of Pack is required").notEmpty(),
  // body("pack_of", "Pack of only containe number").isNumeric(),
  body("ideal_for", "Ideal for is required").notEmpty(),
  body("ideal_for").custom((value, { req }) => {
    if (!ideal_for.includes(value)) {
      throw new Error(
        "Invalid Ideal for. Please use 'male','female' or 'kids'"
      );
    }
    return true;
  }),
];

const CreateVarientValidation = [
  body("product_id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isNumeric()
    .withMessage("Product ID must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblproduct` where product_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid product ID`);
      }
    }),
  body("color_id")
    .notEmpty()
    .withMessage("Color is required")
    .isNumeric()
    .withMessage("color_id is must be in number"),
  body("size_id")
    .notEmpty()
    .withMessage("Size is required")
    .isNumeric()
    .withMessage("size_id is must be in number"),
];

const UpdateProductValidation = [
  body("product_id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isNumeric()
    .withMessage("Product ID must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblproduct` where product_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid product ID`);
      }
    }),
  body("pc_id", "pc_id is required").notEmpty(),
  body("product_title", "product_title is required").notEmpty(),
  body("product_title", "product title can not containe only number").matches(
    /[^0-9]/
  ),
  body("product_desc", "product_desc is required").notEmpty(),
  body("pack_of", "Number of Pack is required").notEmpty(),
  body("pack_of", "Pack of only containe number").isNumeric(),
  body("ideal_for", "Ideal for is required").notEmpty(),
  body("ideal_for").custom((value, { req }) => {
    if (!ideal_for.includes(value)) {
      throw new Error(
        "Invalid Ideal for. Please use 'male','female' or 'kids'"
      );
    }
    return true;
  }),
];

const SingalProductValidation = [
  query("id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isNumeric()
    .withMessage("Product ID must be in number"),
];

const DelteVariantValidation = [
  body("variant_id")
    .notEmpty()
    .withMessage("Variant ID is required")
    .isNumeric()
    .withMessage("Variant ID must be in number"),
];
const GetAllVariantValidation = [
  body("product_id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isNumeric()
    .withMessage("Product ID must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblproduct` where product_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid product ID`);
      }
    }),

  body("color_id")
    .optional()
    .notEmpty()
    .withMessage("Color ID is required")
    .isNumeric()
    .withMessage("Color ID must be in number")
    .custom(async (value, { req }) => {
      const product_id = req.body.product_id;
      const [isExits] = await db.query(
        "SELECT * FROM `tblvariant` where product_id = ? AND color_id = ?",
        [product_id, value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid color ID`);
      }
    }),
];

const UpdateVariantValidation = [
  body().isArray().withMessage("Body must be an array"),
  body("*.variant_id")
    .notEmpty()
    .withMessage("Variant ID is required")
    .isNumeric()
    .withMessage("Variant ID must be a number")
    .custom(async (value, { req, path }) => {
      const [result] = await db.query(
        "SELECT * FROM tblvariant WHERE variant_id = ?",
        [value]
      );
      if (!result.length) {
        throw new Error("Invalid variant_id");
      }
      return true;
    }),
  body().custom((value, { req, path }) => {
    value.forEach((item, index) => {
      const hasAtLeastOne = required_list.some(
        (field) => item[field] !== undefined && item[field] !== null
      );
      if (!hasAtLeastOne) {
        throw new Error(
          `At least one field required from ${required_list.join(
            ", "
          )} in object at index ${index}`
        );
      }
    });
    return true;
  }),
  body("*.price")
    .optional()
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .customSanitizer((value) => Number(value).toFixed(2)),
  body("*.sale_price")
    .optional()
    .notEmpty()
    .withMessage("Sale price is required")
    .isNumeric()
    .withMessage("Sale price must be a number")
    .customSanitizer((value) => Number(value).toFixed(2)),
  body("*.stock")
    .optional()
    .notEmpty()
    .withMessage("Stock is required")
    .isNumeric()
    .withMessage("Stock must be a number")
    .toInt(),
  body("*.variant_status")
    .optional()
    .notEmpty()
    .withMessage("Variant status is required")
    .isBoolean()
    .withMessage("Variant status must be a boolean")
    .toInt(),
  body("*.sku_id")
    .optional()
    .notEmpty()
    .withMessage("SKU ID is required")
    .matches(/^\S*$/)
    .withMessage("sku_id is must be without space")
    .custom(async (value, { req }) => {
      const sku_ids = req.body.map((item) => {
        return item.sku_id;
      });
      if (new Set(sku_ids).size !== sku_ids.length) {
        throw new Error("sku_id is must be unique");
      }

      const [isExits] = await db.query(
        "SELECT * FROM tblvariant WHERE sku_id = ? ",
        [value]
      );
      if (isExits.length) {
        throw new Error("sku_id is must be unique");
      }

      return true;
    }),
];

const UploadImagesValidation = [
  body("product_id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isNumeric()
    .withMessage("Product ID must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblproduct` where product_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid product ID`);
      }
    }),

  body("color_id")
    .optional()
    .notEmpty()
    .withMessage("Color ID is required")
    .isNumeric()
    .withMessage("Color ID must be in number"),
];

module.exports = {
  CreateProductValidation,
  CreateVarientValidation,
  UpdateProductValidation,
  SingalProductValidation,
  DelteVariantValidation,
  GetAllVariantValidation,
  UpdateVariantValidation,
  UploadImagesValidation,
};
