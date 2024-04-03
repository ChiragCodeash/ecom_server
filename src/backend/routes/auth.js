const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const db = require("../../db/db");
const {
  registerValidation,
  loginValidation,
} = require("../validation/AuthValidation");
const secretKey = process.env.JSON_SECRET_KEY;
const ValidationError = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: errors.errors.map((error) => {
        return error.msg;
      })[0],
    });
  }
};

// Registaration API ----------------------------------------------------
router.post("/registration", registerValidation, async (req, res) => {
  let status = false;
  const { email, password, uname } = req.body;
  try {
    // ValidationError(req, res);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.errors.map((error) => {
          return error.msg;
        })[0],
      });
    }
    const [isExits] = await db.query("SELECT * FROM `tbladmin` WHERE email=?", [
      email,
    ]);
    if (!isExits.length) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      const [isSuccess] = await db.query(
        "INSERT INTO `tbladmin`( `uname`, `email`, `password`) VALUES (?,?,?)",
        [uname, email, hashPassword]
      );
      if (isSuccess.affectedRows) {
        res.status(200).json({
          status: true,
          message: "Registration Success",
        });
      } else {
        res.status(200).json({
          status,
          message: "Something went wrong..!",
        });
      }
    } else {
      res.status(400).json({
        status,
        message: "This email is already used",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "server error",
    });
  }
});

// Login API -------------------------------------------------------------
router.post("/login", loginValidation, async (req, res) => {
  let status = false;
  const { email, password } = req.body;
  try {
    // ValidationError(req , res);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.errors.map((error) => {
          return error.msg;
        })[0],
      });
    }
    const [isExits] = await db.query("SELECT * FROM `tbladmin` WHERE email=?", [
      email,
    ]);
    if (isExits.length) {
      const hashPassword = isExits[0].password;
      const result = await bcrypt.compare(password, hashPassword);
      if (result) {
        const payload = {
          uid: isExits[0].uid,
        };
        const token = jwt.sign(payload, secretKey);
        res.status(200).json({
          status: true,
          message: "Login success",
          token: token,
          data: {
            uname: isExits[0].uname,
            email: isExits[0].email,
          },
        });
      } else {
        res.status(400).json({
          status,
          message: "Incorrect email or password, Please try again",
        });
      }
    } else {
      res.status(400).json({
        status,
        message: "User not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "server error",
    });
  }
});

module.exports = router;
