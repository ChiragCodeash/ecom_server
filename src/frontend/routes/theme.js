const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const db = require("../../db/db");
const { updateThemeValidation } = require("../validation/ThemeValidation");

// Get Theme Object
router.get("/", async (req, res) => {
  let status = true;
  try {
    const [[data]] = await db.query("SELECT * from tbltheme");
    res.status(200).json(JSON.parse(data.theme_obj));
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "server error",
    });
  }
});

// Update Theme Object
router.post("/updatetheme", updateThemeValidation, async (req, res) => {
  let status = false;
  const { theme_obj } = req.body;
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
    const [data] = await db.query(
      "UPDATE `tbltheme` SET `theme_obj`=? WHERE theme_id=5",
      [JSON.stringify(theme_obj)]
    );
    if(data.affectedRows){
      res.status(200).json({
        status : true,
        message : "Suceess"
      })
    }else{
      res.status(200).json({
        status,
        message : "Something went wrong...!"
      })
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
