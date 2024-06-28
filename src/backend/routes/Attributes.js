const express = require("express");
const router = express.Router();
const db = require("../../db/db");
const fetchUser = require("../../middleware/fetchUser");
const {
  addColorValidation,
  addSizeValidation,
  deleteSizeValidation,
  deleteColorValidation,
} = require("../validation/ColorSizeValidation");
const { validationResult } = require("express-validator");
const expressValidationErrorHandler = require("../../middleware/expressValidationErrorHandler");

router.use(fetchUser);

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

// ROUTE 3 : Get Size And Color Name
router.get("/", async (req, res) => {
  let status = false;
  try {
    const [size] = await db.query("SELECT * FROM `tblsize` WHERE active = 1 ");
    const [color] = await db.query(
      "SELECT * FROM `tblcolor` WHERE active = 1 "
    );

    res.status(200).json({
      status: true,
      message: "Success",
      data: {
        color,
        size,
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

// ROUTE 4 : Add Color Name
router.post("/addcolor", addColorValidation, async (req, res) => {
  let status = false;
  const { colors } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.errors.map((error) => {
          return error.msg;
        })[0],
      });
    }
    const values = colors.map((color) => `('${color}')`).join(",");
    const [is_added] = await db.query(
      `INSERT INTO tblcolor(color_name) VALUES  ${values}`
    );
    var res_data;
    if (is_added.affectedRows) {
      const [data] = await db.query("SELECT * FROM `tblcolor`");
      res_data = {
        status: true,
        message: "New colors added",
        data,
      };
    } else {
      res_data = {
        status: false,
        message: "Error to add colors",
      };
    }
    res.status(200).json(res_data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "server error",
    });
  }
});

// ROUTE 4 : Add Size Name
router.post("/addsize", addSizeValidation, async (req, res) => {
  let status = false;
  const { sizes } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: errors.errors.map((error) => {
          return error.msg;
        })[0],
      });
    }
    const values = sizes.map((size) => `('${size}')`).join(",");
    const [is_added] = await db.query(
      `INSERT INTO tblsize(size_name) VALUES  ${values}`
    );
    var res_data;
    if (is_added.affectedRows) {
      const [data] = await db.query("SELECT * FROM `tblsize`");
      res_data = {
        status: true,
        message: "New sizes added",
        data,
      };
    } else {
      res_data = {
        status: false,
        message: "Error to add sizes",
      };
    }
    res.status(200).json(res_data);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "server error",
    });
  }
});

// ROUTE 5 : Delete size Name
router.delete(
  "/deletesize",
  fetchUser,
  deleteSizeValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    let status = false;
    const { size_id } = req.body;
    try {
      const values = size_id.toString();
      const [data] = await db.query(
        `UPDATE tblsize SET active = 0 WHERE  size_id IN(${values})`
      );
      res.status(200).json({
        status: true,
        message: "Sizes deleted",
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        status,
        message: "server error",
      });
    }
  }
);

// ROUTE 6 : Delete Color Name
router.delete(
  "/deletecolor",
  expressValidationErrorHandler,
  fetchUser,
  deleteColorValidation,
  async (req, res) => {
    let status = false;
    const { color_id } = req.body;
    try {
      const values = color_id.toString();
      const [data] = await db.query(
        `UPDATE  tblcolor SET active = 0 WHERE  color_id IN(${values})`
      );
      res.status(200).json({
        status: true,
        message: "Colors deleted",
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        status,
        message: "server error",
      });
    }
  }
);

// ROUTE 7 : Delete Color Name
router.get(
  "/getattribute",
  expressValidationErrorHandler,
  fetchUser,
  async (req, res) => {
    let status = false;
    try {
      const [fabric] = await db.query(
        `SELECT * FROM attributes WHERE  type = 'fabric'`
      );
      const [occasion] = await db.query(
        `SELECT * FROM attributes WHERE  type = 'occasion'`
      );
      const [style] = await db.query(
        `SELECT * FROM attributes WHERE  type = 'style'`
      );
      res.status(200).json({
        status: true,
        message: "Success",
        data : {
          fabric , occasion , style
        }
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        status,
        message: "server error",
      });
    }
  }
);

module.exports = router;
