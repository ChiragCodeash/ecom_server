const { body } = require("express-validator");
const db = require("../../db/db");
const cityAndState = require("../../cityAndState");

const required_list = ["mno", "name"];
// const state = Object.keys(cityAndState).map((item => item.toLowerCase()));
const state = Object.keys(cityAndState);

const UpdateProfileValidation = [
  body().custom((value, { req, path }) => {
    const isValid = required_list.some(
      (key) => req.body[key] !== undefined && req.body[key] !== null
    );
    if (!isValid) {
      throw new Error("At least one of the keys is required from mno, name");
    }
    return true;
  }),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Please provide your name to proceed.")
    .isLength({ min: 3 })
    .withMessage("Please enter a name with at least 3 characters.")
    .isLength({ max: 25})
    .withMessage("Please enter a name with fewer than 25 characters.")
    .matches(/[^0-9]/)
    .withMessage("Please enter a valid name with letters."),
  //   body("email")
  //   .optional()
  //     .notEmpty()
  //     .withMessage("Please provide your email to proceed.")
  //     .isEmail()
  //     .withMessage("Please provide valid email.")
  //     .custom(async (value, { req }) => {
  //       const [data] = await db.query("SELECT * FROM user WHERE email = ? ", [
  //         value,
  //       ]);
  //       if (data.length) {
  //         throw new Error("This email is already in use.");
  //       }
  //       return true;
  //     }),
  body("mno")
    .optional()
    .notEmpty()
    .withMessage("Please provide your mobile number to proceed.")
    .isNumeric()
    .withMessage("Mobile number must be in number.")
    .isLength({ min: 10, max: 10 })
    .withMessage("Please provide valid mobile number.")
    .custom(async (value, { req }) => {
      const { id } = req.user;
      const [data] = await db.query(
        "SELECT * FROM user WHERE mno = ? AND uid  != ? ",
        [value, id]
      );
      if (data.length) {
        throw new Error("This number is already in use.");
      }
      return true;
    }),
];

const UpdateAddressValidation = [
  body("line1")
    .notEmpty()
    .withMessage("Please provide your line1 to proceed.")
    .isLength({ min: 3 })
    .withMessage("Please enter a line1 with at least 3 characters.")
    .isLength({ max: 100 })
    .withMessage("Please enter a line1 with fewer than 15 characters."),
  body("line2")
    .notEmpty()
    .withMessage("Please provide your line2 to proceed.")
    .isLength({ min: 3 })
    .withMessage("Please enter a line2 with at least 3 characters.")
    .isLength({ max: 100 })
    .withMessage("Please enter a line2 with fewer than 15 characters."),
  body("pincode")
    .notEmpty()
    .withMessage("Please provide your pincode to proceed.")
    .isNumeric()
    .withMessage("Pincode is must be in number")
    .isLength({ min: 6, max: 6 })
    .withMessage("Please enter a valid pincode."),
  body("area")
    .notEmpty()
    .withMessage("Please provide your area to proceed.")
    .isLength({ min: 3 })
    .withMessage("Please enter a area with at least 3 characters.")
    .isLength({ max: 50 })
    .withMessage("Please enter a area with fewer than 50 characters."),
  body("state")
    .notEmpty()
    .withMessage("Please provide your state to proceed.")
    .isIn(state)
    .withMessage("Please provide valid state name"),
  body("city")
    .notEmpty()
    .withMessage("Please provide your city to proceed.")
    .custom((value, { req }) => {
        // console.log("state===>" , state)
      const city = cityAndState[req.body.state];
      if (!city.includes(value)) {
        throw new Error("Please provide valid city name");
      }
      return true;
    }),
  // .isIn(state)
  // .withMessage("Please provide valid city name"),
];

module.exports = {
  UpdateProfileValidation,
  UpdateAddressValidation,
};
