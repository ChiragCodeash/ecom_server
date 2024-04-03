const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const db = require("../../db/db");

// ROUTE 1 : Get Category Name
router.get("/", async (req, res) => {
  let status = false;
  try {
    const [data] = await db.query(
      "SELECT pc_id , category_name FROM `tblproductcategory`"
    );

    res.status(200).json({
      status: true,
      message: "Success",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "server error",
    });
  }
});

// ROUTE 2 : Get Singal Category Data
router.get("/:id", async (req, res) => {
  let status = false;
  const { id } = req.params;
  try {
    const [[data]] = await db.query(
      "SELECT * FROM `tblproductcategory` WHERE pc_id=?",
      [id]
    );
    if (data) {
      res.status(200).json({
        status: true,
        message: "Success",
        data: { ...data, category_field: JSON.parse(data.category_field) },
      });
    } else {
      res.status(400).json({
        status,
        message: "No data found",
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
