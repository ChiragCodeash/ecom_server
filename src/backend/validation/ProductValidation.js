const { body, query, param } = require("express-validator");

const ideal_for = ["male", "female", "kids"];

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
  body("product_id", "Product ID is required").notEmpty(),
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
  body("product_id", "Product ID is required").notEmpty(),
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
    .withMessage("Product ID must be in number"),

  body("color_id")
    .optional()
    .notEmpty()
    .withMessage("Color ID is required")
    .isNumeric()
    .withMessage("Color ID must be in number"),
];

const UpdateVariantValidation = [
  body("variant_id")
    .notEmpty()
    .withMessage("Variant ID is required")
    .isNumeric()
    .withMessage("Variant ID must be in number"),
  body("product_length")
    .notEmpty()
    .withMessage("Product length is required")
    .isNumeric()
    .withMessage("Product length must be in number"),
  body("product_width")
    .notEmpty()
    .withMessage("Product width is required")
    .isNumeric()
    .withMessage("Product width must be in number"),
  body("product_height")
    .notEmpty()
    .withMessage("Product height is required")
    .isNumeric()
    .withMessage("Product height must be in number"),
  body("product_weight")
    .notEmpty()
    .withMessage("Product weight is required")
    .isNumeric()
    .withMessage("Product weight must be in number"),
  body("product_stock")
    .notEmpty()
    .withMessage("Product stock is required")
    .isNumeric()
    .withMessage("Product stock must be in number"),
  body("sale_price")
    .notEmpty()
    .withMessage("Product sale price is required")
    .isNumeric()
    .withMessage("Product sale price must be in number"),
  body("product_price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be in number"),
  body("sku_id").notEmpty().withMessage("SKU ID is required"),
];

module.exports = {
  CreateProductValidation,
  CreateVarientValidation,
  UpdateProductValidation,
  SingalProductValidation,
  DelteVariantValidation,
  UpdateVariantValidation,
  GetAllVariantValidation,
};
