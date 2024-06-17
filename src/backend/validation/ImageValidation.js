const { body } = require("express-validator");
const db = require("../../db/db");

const allowExtension = ["image/png", "image/jpg", "image/jpeg"];

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
    .notEmpty()
    .withMessage("Color ID is required")
    .isNumeric()
    .withMessage("Color ID must be in number")
    .custom(async (value) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblcolor` where color_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid Color ID`);
      }
    }),
  body().custom(async (value, { req }) => {
    const { product_id, color_id } = req.body;
    const files = req.files;

    const [data] = await db.query(
      "SELECT * FROM tblimages WHERE color_id = ? AND product_id = ?",
      [color_id, product_id]
    );
    var img_arr_len = 0;
    if (data.length) {
      img_arr_len = JSON.parse(data[0].image_array).length;
    }
    const total = +img_arr_len + +files.length;

    if (total > 5) {
      throw new Error("You can add only 5 images");
    }
    if (files.length) {
      const files = req.files;
      files.map((item, i) => {
        if (!allowExtension.includes(item.mimetype)) {
          throw new Error("Product images are must be In .jpg, .jpeg and .png");
        }
      });
    } else {
      throw new Error("Product images are required");
    }
    return true;
  }),
];

const DeleteImageValidation = [
  body("index")
    .notEmpty()
    .withMessage("Index is required")
    .isInt({ min: 0, max: 5 })
    .withMessage("Index must be in number and between 1 to 5"),
  body("image_id")
    .notEmpty()
    .withMessage("Image ID is required")
    .isNumeric()
    .withMessage("Image ID must be in number")
    .custom(async (value, { req }) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblimages` where image_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid Image ID`);
      }
      req.image = isExits[0];
      return true;
    }),
];

const UpdateImageValidation = [
  body("index")
    .notEmpty()
    .withMessage("Index is required")
    .isInt({ min: 0, max: 5 })
    .withMessage("Index must be in number and between 1 to 5"),
  body("image_id")
    .notEmpty()
    .withMessage("Image ID is required")
    .isNumeric()
    .withMessage("Image ID must be in number")
    .custom(async (value, { req }) => {
      const [isExits] = await db.query(
        "SELECT * FROM `tblimages` where image_id = ?",
        [value]
      );
      if (!isExits.length) {
        throw new Error(`'${value}' is invalid Image ID`);
      }
      req.image = isExits[0];
      return true;
    }),
  body().custom(async (value, { req }) => {
    if (req.files.length) {
      const files = req.files;
      files.map((item, i) => {
        if (!allowExtension.includes(item.mimetype)) {
          throw new Error("Product images are must be In .jpg, .jpeg and .png");
        }
      });
    } else {
      throw new Error("Product image is required");
    }
    return true;
  }),
];

module.exports = {
  UploadImagesValidation,
  DeleteImageValidation,
  UpdateImageValidation,
};
