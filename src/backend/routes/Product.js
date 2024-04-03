const express = require("express");
const router = express.Router();
const db = require("../../db/db");
const {
  CreateProductValidation,
  CreateVarientValidation,
  UpdateProductValidation,
  SingalProductValidation,
  DelteVariantValidation,
  UpdateVariantValidation,
  GetAllVariantValidation,
} = require("../validation/ProductValidation");
const { validationResult, body, params } = require("express-validator");
const fetchUser = require("../../middleware/fetchUser");
const multer = require("multer");
// const upload = multer();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads"); // Destination folder where files will be stored
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only images are allowed!'), false);
//   }
// };
// const upload = multer({ storage: storage, fileFilter: fileFilter });

// Create A Product
router.post("/createproduct", CreateProductValidation, async (req, res) => {
  let status = false;
  const { pc_id, product_title, product_desc, pack_of, ideal_for } = req.body;

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
      "INSERT INTO `tblproduct`( `pc_id` ,`product_title`,`product_desc` ,`pack_of` , `ideal_for`) VALUES (?,?,?,?,?)",
      [pc_id, product_title, product_desc, pack_of, ideal_for]
    );
    if (data.affectedRows) {
      res.status(200).json({
        status: true,
        message: "Success",
        product_id: data.insertId,
      });
    } else {
      res.status(200).json({
        status,
        message: "Something went wrong",
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

// Create product varient
router.post("/createvarient", CreateVarientValidation, async (req, res) => {
  let status = false;
  const { product_id, color_id, size_id } = req.body;

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

    // const varientArray = varient.map((varient, i) => {
    //   return [product_id, ...varient];
    // });
    // console.log(varientArray)

    const [isExits] = await db.query(
      "SELECT * FROM tblvariant WHERE product_id =? AND size_id=? AND color_id=?",
      [product_id, size_id, color_id]
    );
    if (!isExits.length) {
      const [data] = await db.query(
        "INSERT INTO `tblvariant`( `product_id` ,`size_id`,`color_id`) VALUES (? , ? , ?)",
        [product_id, size_id, color_id]
      );
      res.status(200).json({
        status: true,
        message: "Success",
        variant_id: data.insertId,
      });
    } else {
      res.status(400).json({
        status,
        message: "This variant is already exits",
      });
    }
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error);
    res.status(400).json({
      status,
      message: "Server error",
    });
  }
  // console.log("🚀 ~ router.post ~ data:", data)
});

// Update Product
router.post("/updateproduct", UpdateProductValidation, async (req, res) => {
  let status = false;
  const { product_title, pack_of, ideal_for, product_desc, pc_id, product_id } =
    req.body;
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
      "UPDATE `tblproduct` SET `product_title`=?,`pack_of`=?,`ideal_for`=?,`product_desc`=?,`pc_id`=? WHERE product_id= ?",
      [product_title, pack_of, ideal_for, product_desc, pc_id, product_id]
    );
    if (data.affectedRows) {
      // console.log("🚀 ~ router.post ~ data:", data);
      res.status(200).send({
        status: true,
        message: "Change Saved",
      });
    } else {
      res.status(400).send({
        status,
        message: "Something went wrong",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      status,
      message: "Server Error",
    });
  }
});

router.get("/getsingalproduct", SingalProductValidation, async (req, res) => {
  let status = false;
  const { id } = req.query;

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
      "SELECT * FROM tblproduct WHERE product_id=?",
      [id]
    );
    if (data.length) {
      res.status(200).json({
        status: true,
        message: "Success",
        data: data[0],
      });
    } else {
      res.status(400).json({
        status,
        message: "No Data",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "Server error",
    });
  }
});

// Update Variant
router.post("/updatevariant", UpdateVariantValidation, async (req, res) => {
  let status = false;
  let response = {
    status: true,
    message: "success",
  };
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
    const {
      variant_id,
      product_length,
      product_width,
      product_height,
      product_weight,
      product_stock,
      sku_id,
      sale_price,
      product_price,
    } = req.body;
    const [is_exits] = await db.query(
      "SELECT * FROM tblvariant WHERE variant_id = ?",
      [variant_id]
    );
    if (is_exits.length) {
      const [data] = await db.query(
        "UPDATE `tblvariant` SET `sku_name`=?,`price`=?,`sale_price`=?,`stock`=?,`width`=?,`height`=?,`weight`=?,`length`=?,`variant_status`=? WHERE variant_id = ?",
        [
          sku_id,
          product_price.toFixed(2),
          sale_price.toFixed(2),
          product_stock,
          product_width.toFixed(2),
          product_height.toFixed(2),
          product_weight.toFixed(2),
          product_length.toFixed(2),
          1,
          variant_id,
        ]
      );
      if (data.affectedRows) {
        response["status"] = true;
        response["message"] = "Changes saved";
      }
    } else {
      response["status"] = false;
      response["message"] = "Invalid variant ID";
    }
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "Server error",
    });
  }
});

// Delete Variant
router.delete("/deletevariant", DelteVariantValidation, async (req, res) => {
  let status = false;
  const { variant_id } = req.body;
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
    const [data] = await db.query("DELETE FROM tblvariant where variant_id=?", [
      variant_id,
    ]);
    if (data.affectedRows) {
      res.status(200).json({
        status: true,
        message: "Variant deleted",
      });
    } else {
      res.status(400).json({
        status,
        message: "Variant not exits",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status,
      message: "Server error",
    });
  }
});

// Get All Variant Product Wise
router.post("/getallvarient", GetAllVariantValidation, async (req, res) => {
  const status = false;
  const { product_id, color_id } = req.body;
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

    // const [data] = await db.query(
    //   "SELECT v.* , c.color_name, s.size_name FROM tblvariant v LEFT JOIN tblcolor c ON v.color_id = c.color_id LEFT JOIN tblsize s ON v.size_id = s.size_id WHERE v.product_id = ?",
    //   [product_id]
    // );
    const [color] = await db.query(
      "SELECT DISTINCT  c.color_id , c.color_name from tblvariant v JOIN tblcolor c ON c.color_id = v.color_id WHERE v.product_id = ? ORDER BY v.created_date;",
      [product_id]
    );
    // console.log(color_id)
    // console.log(color)
    if (color_id || color.length) {
      var [variants] = await db.query(
        "SELECT v.* , s.size_name FROM tblvariant v  JOIN tblsize s ON s.size_id = v.size_id WHERE v.color_id = ? AND v.product_id = ? ORDER BY v.created_date;",
        [color_id || color[0].color_id, product_id]
      );
    } else {
      var variants = [];
    }
    // if (data.length) {
    // const groupedByColor = data.reduce((groups, item) => {
    //   const { color_id, color_name, ...rest } = item;
    //   if (!groups[color_id]) {
    //     groups[color_id] = { color_id, color_name, variants: [] };
    //   }
    //   groups[color_id].variants.push(rest);
    //   return groups;
    // }, {});
    // const result = Object.values(groupedByColor);
    const data = {
      color,
      variants,
    };
    res.status(200).json({ status: true, message: "Success", data });
    // } else {
    //   res.status(200).json({ status, message: "No Data" });
    // }
    // } else {
    //   res.status(200).json({
    //     status,
    //     message: "Product ID is required",
    //   });
    // }
  } catch (error) {
    console.log("🚀 ~ router.get ~ error:", error);
    res.status(400).json({
      status,
      message: "server error",
    });
  }
});
module.exports = router;
