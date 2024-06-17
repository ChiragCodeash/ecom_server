const { body } = require("express-validator");
const db = require("../../db/db");

const addColorValidation = [
  body("colors")
    .notEmpty()
    .withMessage("colors is required")
    .isArray()
    .withMessage("colors must be in array")
    .isArray({min : 1})
    .withMessage("colors array is empty")
    .custom(async (value) => {
      for (let index = 0; index < value.length; index++) {
        const element = value[index];
        const [isExits] = await db.query(
          "SELECT * FROM `tblcolor` where color_name = ?",
          [element]
        );
        if (isExits.length) {
          throw new Error(`'${element}' is already added`);
        }
      }
      //   console.log(value);
    }),
];
const addSizeValidation = [
  body("sizes")
    .notEmpty()
    .withMessage("sizes is required")
    .isArray()
    .withMessage("sizes must be in array")
    .custom(async (value) => {
      for (let index = 0; index < value.length; index++) {
        const element = value[index];
        const [isExits] = await db.query(
          "SELECT * FROM `tblsize` where size_name = ?",
          [element]
        );
        if (isExits.length) {
          throw new Error(`'${element}' is already added`);
        }
      }
    }),
];

const deleteSizeValidation = [
  body("size_id")
    .notEmpty()
    .withMessage("Size ID is required")
    .isArray({ min: 1 })
    .withMessage("Size ID must be in array")
    .custom(async (value) => {
      for (let index = 0; index < value.length; index++) {
        const element = value[index];
        if (typeof element != "number") {
          throw new Error(`'${element}' must be in number`);
        }
      }
    })
    .custom(async (value) => {
      for (let index = 0; index < value.length; index++) {
        const element = value[index];
        const [isExits] = await db.query(
          "SELECT * FROM `tblsize` where size_id = ?",
          [element]
        );
        if (!isExits.length) {
          throw new Error(`'${element}' is invalid size ID`);
        }
      }
    }),
];
const deleteColorValidation = [
  body("color_id")
    .notEmpty()
    .withMessage("Color ID is required")
    .isArray({ min: 1 })
    .withMessage("Color ID must be in array")
    .custom(async (value) => {
      for (let index = 0; index < value.length; index++) {
        const element = value[index];
        if (typeof element != "number") {
          throw new Error(`'${element}' must be in number`);
        }
      }
    })
    .custom(async (value) => {
      for (let index = 0; index < value.length; index++) {
        const element = value[index];
        const [isExits] = await db.query(
          "SELECT * FROM `tblcolor` where color_id = ?",
          [element]
        );
        if (!isExits.length) {
          throw new Error(`'${element}' is invalid color ID`);
        }
      }
    }),
];

module.exports = {
  addColorValidation,
  addSizeValidation,
  deleteSizeValidation,
  deleteColorValidation,
};
