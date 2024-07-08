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
  CheckVariantValidation,
  GetProductValidation,
  GetVariantValidation,
  DelteProductValidation,
} = require("../validation/ProductValidation");
const { validationResult, body } = require("express-validator");
const uploadImage = require("../../middleware/uploadImages");
const deleteFile = require("../../utils/deleteFile");
const expressValidationErrorHandler = require("../../middleware/expressValidationErrorHandler");
const genratePublicUrl = require("../../utils/genratePublicUrl");

const IMG_URL = `${process.env.URL}/images`;
const PRODUCT_URL = `/images/product`;
const RECORD_PER_PAGE = +process.env.RECORD_PER_PAGE;

// Create A Product
router.post("/createproduct", CreateProductValidation, async (req, res) => {
  let status = false;
  const { pc_id, product_title, product_desc, fabric, style, occasion } =
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
      "INSERT INTO `tblproduct`( `pc_id` ,`product_title`,`product_desc` ,`fabric` , `style` , `occasion`) VALUES (?,?,?,?,?,?)",
      [pc_id, product_title, product_desc, fabric, style, occasion]
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
router.post(
  "/createvarient",
  CreateVarientValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    let status = false;
    const { product_id, color_id, size_id } = req.body;

    try {
      // const varientArray = varient.map((varient, i) => {
      //   return [product_id, ...varient];
      // });
      // console.log(varientArray)

      const [isExits] = await db.query(
        "SELECT * FROM tblvariant WHERE product_id =? AND size_id=? AND color_id=?",
        [product_id, size_id, color_id]
      );
      if (!isExits.length) {
        const [[image_data]] = await db.query(
          "SELECT image_id FROM tblimages WHERE product_id = ? AND color_id = ? ",
          [product_id, color_id]
        );
        // console.log(data1)
        // return
        if (image_data) {
          var [data] = await db.query(
            "INSERT INTO `tblvariant`( `product_id` ,`size_id`,`color_id` , `image_id`) VALUES (? , ? , ? , ?)",
            [product_id, size_id, color_id, image_data.image_id]
          );
        } else {
          [data] = await db.query(
            "INSERT INTO `tblvariant`( `product_id` ,`size_id`,`color_id` ) VALUES (? , ? , ? )",
            [product_id, size_id, color_id]
          );
        }
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
  }
);

// Update Product
router.post(
  "/updateproduct",
  UpdateProductValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    // let status = false;
    const {
      product_title,
      fabric,
      style,
      occasion,
      product_desc,
      pc_id,
      product_id,
      status,
    } = req.body;
    try {
      let updateQuery = "UPDATE tblproduct  SET ";
      const updateKeyArr = [];
      const updateValueArr = [];

      if (product_title) {
        updateKeyArr.push(`product_title = ?`);
        updateValueArr.push(product_title);
      }
      if (fabric) {
        updateKeyArr.push(`fabric = ?`);
        updateValueArr.push(fabric);
      }
      if (style) {
        updateKeyArr.push(`style = ?`);
        updateValueArr.push(style);
      }
      if (occasion) {
        updateKeyArr.push(`occasion = ?`);
        updateValueArr.push(occasion);
      }

      if (product_desc) {
        updateKeyArr.push(`product_desc = ?`);
        updateValueArr.push(product_desc);
      }
      if (pc_id) {
        updateKeyArr.push(`pc_id = ?`);
        updateValueArr.push(pc_id);
      }
      if (status) {
        updateKeyArr.push(`status = ?`);
        updateValueArr.push(status);
      }

      updateQuery += `${updateKeyArr.join(",")} WHERE product_id = ?`;

      const [data] = await db.query(updateQuery, [
        ...updateValueArr,
        product_id,
      ]);

      // const [data] = await db.query(
      //   "UPDATE `tblproduct` SET `product_title`=?,`pack_of`=?,`ideal_for`=?,`product_desc`=?,`pc_id`=? WHERE product_id= ?",
      //   [product_title, pack_of, ideal_for, product_desc, pc_id, product_id]
      // );
      if (data.affectedRows) {
        // console.log("🚀 ~ router.post ~ data:", data);
        res.status(200).send({
          status: true,
          message: "Change Saved",
        });
      } else {
        res.status(400).send({
          status: false,
          message: "Something went wrong",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({
        status: false,
        message: "Server Error",
      });
    }
  }
);

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
      req.body.map(
        async (
          { price, sale_price, stock, variant_status, variant_id, sku_id },
          i
        ) => {
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

          updateQuery += `${updateKeyArr.join(",")} WHERE variant_id = ?`;

          const [result] = await db.query(updateQuery, [
            ...updateValueArr,
            variant_id,
          ]);
        }
      );

      res.send({ ...response, message: "Changes saved" });
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

// Check variant
router.post(
  "/checkvariant",
  CheckVariantValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    try {
      let response = {
        status: true,
        message: "success",
      };
      const { product_id } = req.body;

      const [checkIsNullVariant] = await db.query(
        "SELECT color_id , variant_id FROM tblvariant WHERE (sku_id IS NULL OR price IS NULL OR sale_price IS NULL OR stock IS NULL OR image_id IS NULL) AND product_id = ?",
        [product_id]
      );
      if (!checkIsNullVariant.length) {
        db.query(
          "UPDATE tblproduct SET draft= 0 , status = 1 WHERE product_id = ?",
          [product_id]
        );
        db.query(
          "UPDATE tblvariant SET variant_status = 1 WHERE product_id = ?",
          [product_id]
        );

        response = {
          ...response,
          message: "Your product live as soon as possible",
        };
      } else {
        response = {
          status: false,
          message: "Please complate this variant first",
          data: {
            color_id: checkIsNullVariant[0].color_id,
          },
        };
      }

      res.status(200).json(response);
    } catch (error) {
      console.log("🚀 ~ router.get ~ error:", error);
      res.status(400).json({
        status: false,
        message: "server error",
      });
    }
  }
);

// Get all product
router.post(
  "/getproduct",
  GetProductValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    try {
      const { query, page, status, category } = req.body;
      // console.log(query)
      let totalPage;
      let response = {
        status: true,
        message: "Success",
      };
      const keyArr = [];
      const valueArr = [];
      let sql =
        "SELECT p.* , pc.category_name , im.image_array , af.name as fabric_name , ast.name as style_name , ao.name as occasion_name FROM tblproduct p  ";

      sql += ` JOIN tblproductcategory pc ON pc.pc_id = p.pc_id LEFT JOIN tblimages im ON im.product_id = p.product_id LEFT JOIN tblvariant v ON p.product_id = v.product_id `;
      sql += ` LEFT JOIN attributes af ON af.id = p.fabric `;
      sql += ` LEFT JOIN attributes ast ON ast.id = p.style `;
      sql += ` LEFT JOIN attributes ao ON ao.id = p.occasion `;

      if (category) {
        keyArr.push(" p.pc_id = ? ");
        valueArr.push(category);
      }
      if (status || status === 0) {
        if (status === 1 || status === 0) {
          keyArr.push(" p.status = ? ");
          valueArr.push(status);
        } else {
          keyArr.push(" p.draft = ? ");
          valueArr.push(1);
        }
      }
      if (query) {
        keyArr.push(
          `  ( p.product_title LIKE '%${query.trim()}%' OR p.product_desc LIKE '%${query.trim()}%' OR v.sku_id LIKE '%${query.trim()}%' ) `
        );
        // keyArr.push(
        //   `  ( v.sku_id LIKE '%${query.trim()}%' ) `
        // );
        // valueArr.push(category)
      }

      if (keyArr.length) {
        sql += ` WHERE ${keyArr.join(" AND ")}`;
      }

      // sql += ` JOIN tblproductcategory pc ON pc.pc_id = p.pc_id  JOIN tblvariant v ON v.product_id = p.product_id JOIN tblimages im ON im.product_id = v.product_id  `

      sql += ` GROUP BY p.product_id `;
      const [data] = await db.query(sql, valueArr);
      const offset = (page - 1) * RECORD_PER_PAGE;
      sql += `  ORDER BY p.created_date DESC  LIMIT ${RECORD_PER_PAGE} OFFSET ${offset} `;

      // console.log(sql)

      totalPage = Math.ceil(data.length / RECORD_PER_PAGE);

      let [rows, fields] = await db.execute(sql, valueArr);

      rows = rows.map((item, i) => {
        return {
          ...item,
          image_array: genratePublicUrl(
            PRODUCT_URL,
            item.image_array
              ? JSON.parse(item.image_array)[0]
              : "default_product.png"
          ),
        };
      });
      res.send({
        ...response,
        result: {
          data: rows,
          perPage: RECORD_PER_PAGE,
          totalPage,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        status: false,
        message: "Server error",
      });
    }
  }
);

// get all Variants
router.post(
  "/getvariant",
  GetVariantValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    try {
      const { product_id, condition } = req.body;
      const keyArr = [];
      const valueArr = [product_id];
      let sql =
        "SELECT v.* , im.image_array , c.color_name , s.size_name FROM tblvariant v ";

      sql += ` LEFT JOIN tblimages im ON im.image_id = v.image_id  `;
      sql += ` LEFT JOIN tblcolor c ON c.color_id = v.color_id  `;
      sql += ` LEFT JOIN tblsize s ON s.size_id = v.size_id  `;
      sql += ` WHERE v.product_id = ?  `;
      switch (condition) {
        case "ACTIVE":
          keyArr.push(" v.variant_status = ? ");
          valueArr.push(1);
          break;
        case "DEACTIVE":
          keyArr.push(" v.variant_status = ? ");
          valueArr.push(0);
          break;
        case "OUT_OF_STOCK":
          keyArr.push(" v.stock = ? ");
          valueArr.push(0);
          break;
        case "LOW_STOCK":
          keyArr.push(" v.stock < ? ");
          valueArr.push(10);
          break;

        default:
          break;
      }

      if (keyArr.length) {
        sql += ` AND ${keyArr.join(" AND ")}`;
      }
      sql += ` ORDER BY c.color_id`;

      let [rows] = await db.query(sql, valueArr);

      rows = rows.map((item, i) => {
        return {
          ...item,
          image_array: genratePublicUrl(
            PRODUCT_URL,
            item.image_array
              ? JSON.parse(item.image_array)[0]
              : "default_product.png"
          ),
        };
      });
      let response = {
        status: true,
        message: "Success",
        data: rows,
      };
      res.send({
        ...response,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        status: false,
        message: "Server error",
      });
    }
  }
);

router.delete(
  "/deleteproduct",
  DelteProductValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    try {
      const { product_id } = req.body;

      const [image_data] = await db.query(
        "SELECT * FROM tblimages  WHERE product_id = ?",
        [product_id]
      );
      const [data] = await db.query(
        "DELETE FROM tblproduct WHERE product_id = ?",
        [product_id]
      );

      if (data.affectedRows) {
        if (image_data.length) {
          let img_arr = [];
          image_data.map((item, i) => {
            img_arr = [...img_arr, ...JSON.parse(item.image_array)];
            return;
          });
          deleteFile(PRODUCT_URL, img_arr);
        }
        res.status(200).json({
          status: true,
          message: "Product deleted...",
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Something went wrong",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        status: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;
