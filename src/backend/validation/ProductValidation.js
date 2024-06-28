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
  body("pc_id", "pc_id is required")
    .notEmpty()
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblproductcategory` where pc_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid pc_id`);
      }
    }),
  body("product_title")
    .notEmpty()
    .withMessage("product_title is required")
    .notEmpty()
    .matches(/[^0-9]/)
    .withMessage("product title can not containe only number"),
  body("product_desc", "product_desc is required").notEmpty(),
  body("fabric")
    .notEmpty()
    .withMessage("Fabric is required")
    .isNumeric()
    .withMessage("Fabric must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `attributes` where id = ? AND type = 'fabric' ",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid id in fabric`);
      }
    }),
  body("style")
    .notEmpty()
    .withMessage("Style is required")
    .isNumeric()
    .withMessage("Style must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `attributes` where id = ? AND type = 'style' ",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid id in style`);
      }
    }),
  body("occasion")
    .notEmpty()
    .withMessage("Occasion is required")
    .isNumeric()
    .withMessage("Occasion must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `attributes` where id = ? AND type = 'occasion' ",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid id in occasion`);
      }
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
  body("pc_id", "pc_id is required")
    .optional()
    .notEmpty()
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblproductcategory` where pc_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid pc_id`);
      }
    }),
  body("product_title")
    .optional()
    .notEmpty()
    .withMessage("product_title is required")
    .matches(/[^0-9]/)
    .withMessage("product title can not containe only number"),
  body("product_desc")
    .optional()
    .notEmpty()
    .withMessage("product_desc is required"),
  body("fabric")
    .notEmpty()
    .withMessage("Fabric is required")
    .isNumeric()
    .withMessage("Fabric must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `attributes` where id = ? AND type = 'fabric' ",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid id in fabric`);
      }
    }),
  body("style")
    .notEmpty()
    .withMessage("Style is required")
    .isNumeric()
    .withMessage("Style must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `attributes` where id = ? AND type = 'style' ",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid id in style`);
      }
    }),
  body("occasion")
    .notEmpty()
    .withMessage("Occasion is required")
    .isNumeric()
    .withMessage("Occasion must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `attributes` where id = ? AND type = 'occasion' ",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid id in occasion`);
      }
    }),
  body("status").optional().isBoolean().withMessage("Status must be 0 or 1"),
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
    .withMessage("Variant ID must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblvariant` where variant_id  = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid variant ID`);
      }
      return true;
    }),
];

const DelteProductValidation = [
  body("product_id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isNumeric()
    .withMessage("Product ID must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblproduct` where product_id  = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid product ID`);
      }
      return true;
    }),
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
      return true;
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
    .customSanitizer((value) => Number(value).toFixed(3))
    .toFloat(),
  body("*.sale_price")
    .optional()
    .notEmpty()
    .withMessage("Sale price is required")
    .isNumeric()
    .withMessage("Sale price must be a number")
    .customSanitizer((value) => Number(value).toFixed(3))
    .toFloat()
    .custom((value, { req, path }) => {
      path = JSON.parse(path.split(".")[0]);
      // console.log("Sale_price==>" , value)
      // console.log("price==>" , req.body[path].price)
      if (value >= req.body[path].price) {
        throw new Error("Sale price is must be less then actual price");
      }
      return true;
    }),
  body("*.stock")
    .optional()
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0, max: 1000 })
    .withMessage("Stock must be a number , between 1 to 1000"),
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
    .custom(async (value, { req, path }) => {
      path = JSON.parse(path.split(".")[0]);
      const variant_id = req.body[path]["variant_id"];
      const sku_ids = req.body.map((item) => {
        return item.sku_id;
      });
      if (new Set(sku_ids).size !== sku_ids.length) {
        throw new Error("sku_id is must be unique");
      }

      const [isExits] = await db.query(
        "SELECT * FROM tblvariant WHERE sku_id = ? AND variant_id != ?",
        [value, variant_id]
      );
      if (isExits.length) {
        throw new Error("sku_id is must be unique");
      }

      return true;
    }),
];

const CheckVariantValidation = [
  body("product_id")
    .notEmpty()
    .withMessage("product_id is required")
    .isNumeric()
    .withMessage("product_id must be a number")
    .custom(async (value, { req }) => {
      const [isExits] = await db.query(
        "SELECT * FROM tblproduct WHERE product_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error("Invalid product_id");
      }

      const [isAnyVariant] = await db.query(
        "SELECT color_id , variant_id FROM tblvariant WHERE product_id = ?",
        [value]
      );
      if (!isAnyVariant.length) {
        throw new Error("Any variant not created for this product");
      }
      return true;
    }),
];

const GetProductValidation = [
  body("page")
    .notEmpty()
    .withMessage("page is  required")
    .isInt({ min: 1 })
    .withMessage("page must be in number")
    .toInt(),
  body("category")
    .optional({ values: "falsy" })
    .notEmpty()
    .withMessage("category is  required")
    .isNumeric()
    .withMessage("category must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblproductcategory` where pc_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid category`);
      }
    })
    .toInt(),
  body("status")
    .optional({ values: "falsy" })
    .notEmpty()
    .withMessage("status is  required")
    .isNumeric()
    .withMessage("status must be in number")
    .isIn([0, 1, 2])
    .withMessage("status must be from 0, 1, 2")
    .custom((value, { req }) => {
      if (value == 2) {
        req.body.draft = true;
      }
      return true;
    })
    .toInt(),
  body("query")
    .optional({ values: "falsy" })
    .notEmpty()
    .withMessage("query is  required")
    .isString()
    .withMessage("query must be in string")
    .trim(),
];

const GetVariantValidation = [
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
  body("condition")
    .optional({ values: "falsy" })
    .isIn(["ACTIVE", "DEACTIVE", "LOW_STOCK", "OUT_OF_STOCK"])
    .withMessage(
      "condition must be from ACTIVE, DEACTIVE, LOW_STOCK and OUT_OF_STOCK"
    ),
];

module.exports = {
  CreateProductValidation,
  CreateVarientValidation,
  UpdateProductValidation,
  SingalProductValidation,
  DelteVariantValidation,
  GetAllVariantValidation,
  UpdateVariantValidation,
  CheckVariantValidation,
  GetProductValidation,
  GetVariantValidation,
  DelteProductValidation,
};
