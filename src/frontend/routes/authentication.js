const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const bcrypt = require("bcryptjs");
const {
  LoginValidation,
  RegistrationValidation,
} = require("../validation/AuthValidation");
const expressValidationErrorHandler = require("../../middleware/expressValidationErrorHandler");
const db = require("../../db/db");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Registration API
router.post(
  "/registration",
  RegistrationValidation,
  expressValidationErrorHandler,
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const [data] = await db.query(
      "INSERT INTO `user`(`name`, `email`, `password`) VALUES (?,?,?)",
      [name, email, hashPassword]
    );
    if (data.affectedRows) {
      res.status(200).json({
        status: true,
        message: "Congratulations! Your account has been successfully created.",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Something wrong to registration.",
      });
    }
  })
);

// Login API
router.post(
  "/login",
  LoginValidation,
  expressValidationErrorHandler,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    let resData = {
      message: "Success",
      status: true,
    };
    const [isUser] = await db.query("SELECT * FROM user WHERE email = ? ", [
      email,
    ]);
    if (isUser.length) {
      const user = isUser[0];
      const checkPassword = await bcrypt.compare(password, user.password || "");
      if (!checkPassword) {
        resData = {
          message: "Invalid email or password",
          status: false,
        };
      } else {
        const secret = process.env.JWT_FRONTEND_KEY;
        const payload = {
          id: user.uid,
          email: user.email,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "1d" });
       
        resData = {
          message: "Login successful. Enjoy your experience!",
          status: true,
          token,
        };
      }
    } else {
      resData = {
        message: "Invalid email or password",
        status: false,
      };
    }
    res.status(200).json(resData);
  })
);

module.exports = router;
