const express = require("express");
const router = express.Router();
const db = require("../../db/db");
const path = require("path");
const {
  CreateProductValidation,
  CreateVarientValidation,
  UpdateProductValidation,
  SingalProductValidation,
  DelteVariantValidation,
  UpdateVariantValidation,
  GetAllVariantValidation,
  UploadImagesValidation,
} = require("../validation/ProductValidation");
const { validationResult } = require("express-validator");
const uploadImage = require("../../middleware/uploadImages");
const deleteFile = require("../../utils/deleteFile");
const expressValidationErrorHandler = require("../../middleware/expressValidationErrorHandler");
const IMG_URL = `${process.env.URL}/images`;
const PRODUCT_URL = `/images/product`;

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
router.post(
  "/updatevariant",
  UpdateVariantValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    let status = false;
    let response = {
      status: true,
      message: "success",
    };
    try {
      req.body.map(async({price, sale_price, stock, variant_status, variant_id, sku_id} , i)=>{

        let updateQuery = "UPDATE tblvariant  SET ";
        const updateKeyArr = [];
        const updateValueArr = [];
  
        if (price) {
          updateKeyArr.push(`price = ?`);
          updateValueArr.push(price);
        }
        if (sale_price) {
          updateKeyArr.push(`sale_price = ?`);
          updateValueArr.push(sale_price);
        }
        if (typeof variant_status !== "undefined") {
          updateKeyArr.push(`variant_status = ?`);
          updateValueArr.push(variant_status);
        }
        if (stock) {
          updateKeyArr.push(`stock = ?`);
          updateValueArr.push(stock);
        }
        if (sku_id) {
          updateKeyArr.push(`sku_id = ?`);
          updateValueArr.push(sku_id);
        }
  
        updateQuery += `${ updateKeyArr.join(",")
        } WHERE variant_id = ?`;
  
        
        const [result] = await db.query(updateQuery, [
          ...updateValueArr,
          variant_id,
        ]);
      })

      res.send({ ...response , message :'Changes saved' });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        status,
        message: "Server error",
      });
    }
  }
);


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
    let productQuary = `SELECT product_id FROM tblvariant WHERE variant_id = ${variant_id}`;
    let coloridQuary = `SELECT color_id FROM tblvariant WHERE variant_id = ${variant_id}`;
    let mainQuary = `SELECT count(*) as total , color_id , product_id  FROM tblvariant WHERE product_id IN (${productQuary}) AND color_id IN (${coloridQuary});`;

    const [[{ total, color_id, product_id }]] = await db.query(mainQuary);
    if (+total <= 1) {
      let [[data]] = await db.query(
        "SELECT * from tblimages WHERE product_id = ? AND color_id =?",
        [product_id, color_id]
      );
      if (data) {
        let { image_id, image_array } = data;
        await db.query("DELETE FROM tblimages WHERE image_id = ?", [image_id]);
        image_array = JSON.parse(image_array);
        deleteFile(PRODUCT_URL, image_array);
      }
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
    const [color] = await db.query(
      "SELECT DISTINCT  c.color_id , c.color_name from tblvariant v JOIN tblcolor c ON c.color_id = v.color_id WHERE v.product_id = ? ORDER BY v.created_date;",
      [product_id]
    );

    if (color_id || color.length) {
      var [variants] = await db.query(
        "SELECT v.* , s.size_name FROM tblvariant v  JOIN tblsize s ON s.size_id = v.size_id WHERE v.color_id = ? AND v.product_id = ? ORDER BY v.created_date;",
        [color_id || color[0].color_id, product_id]
      );
    } else {
      var variants = [];
    }

    if (color_id || color.length) {
      var [images] = await db.query(
        "SELECT * from tblimages WHERE product_id = ? AND color_id = ?;",
        [product_id, color_id || color[0].color_id]
      );
      if (images) {
        images = images[0];
        if (images) {
          const img_arr = JSON.parse(images.image_array);
          images["image_array"] = img_arr.map((element, i) => {
            return `${IMG_URL}/product/${element}`;
          });
        } else {
          var images = [];
        }
      }
    } else {
      var images = [];
    }

    const data = {
      color,
      variants,
      images,
    };
    res.status(200).json({ status: true, message: "Success", data });
  } catch (error) {
    console.log("🚀 ~ router.get ~ error:", error);
    res.status(400).json({
      status,
      message: "server error",
    });
  }
});

router.post(
  "/uploadimages",
  uploadImage({
    destination: `public/images/product`,
    filenamePrefix: "image",
    fieldName: "images",
    maxSize: 1024 * 1024 * 2,
  }),
  UploadImagesValidation,
  async (req, res) => {
    const status = false;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.files) {
          deleteFile(
            req.files.map((name) => name.filename),
            "public/images/product"
          );
        }
        return res.status(400).json({
          status: false,
          message: errors.errors.map((error) => {
            return error.msg;
          })[0],
        });
      }
      const { product_id, color_id } = req.body;
      const [is_added] = await db.query(
        "SELECT * FROM tblimages WHERE product_id = ? AND color_id = ?",
        [product_id, color_id]
      );
      var response;
      if (is_added.length) {
        const old_img = JSON.parse(is_added[0].image_array);
        const image_id = is_added[0].image_id;
        const img_arr = [
          ...old_img,
          ...req.files.map((img_name) => img_name.filename),
        ];
        var [data] = await db.query(
          "UPDATE `tblimages` SET `product_id`=?,`color_id`=?,`image_array`=? WHERE image_id = ?",
          [product_id, color_id, JSON.stringify(img_arr), image_id]
        );
        response = {
          ...is_added[0],
          image_array: img_arr,
        };
      } else {
        var img_arr = req.files.map((img_name) => img_name.filename);
        var [data] = await db.query(
          "INSERT INTO `tblimages`(`product_id`, `color_id`, `image_array`) VALUES (?,?,?)",
          [product_id, color_id, JSON.stringify(img_arr)]
        );
        response = {
          image_id: data.insertId,
          image_array: img_arr,
          product_id: Number(product_id),
          color_id: Number(color_id),
        };
      }

      response.image_array = response.image_array.map((element, i) => {
        return `${IMG_URL}/product/${element}`;
      });

      if (data.affectedRows) {
        res.status(200).json({
          status: true,
          message: "Image uploaded",
          data: response,
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Unable to add images",
        });
      }
    } catch (error) {
      console.log("🚀 ~ router.get ~ error:", error);
      if (req.files) {
        deleteFile(
          req.files.map((name) => name.filename),
          "public/images/product"
        );
      }
      res.status(400).json({
        status,
        message: "server error",
      });
    }
  }
);
module.exports = router;
