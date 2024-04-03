const express = require("express");
const router = express.Router();
const db = require("../../db/db");

// ROUTE 1 : Get Color Name
router.get("/color", async (req, res) => {
  let status = false;
  try {
    const [data] = await db.query("SELECT * FROM `tblcolor`");

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

// ROUTE 2 : Get Size Name
router.get("/size", async (req, res) => {
  let status = false;
  try {
    const [data] = await db.query("SELECT * FROM `tblsize`");

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

// ROUTE 3 : Get Size Name
router.get("/", async (req, res) => {
  let status = false;
  try {
    const [size] = await db.query("SELECT * FROM `tblsize`");
    const [color] = await db.query("SELECT * FROM `tblcolor`");

    res.status(200).json({
      status: true,
      message: "Success",
      data: {
        color,
        size
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "server error",
    });
  }
});

module.exports = router;
