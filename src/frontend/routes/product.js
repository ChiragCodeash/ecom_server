const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const db = require("../../db/db");
const {
  GetFilterValidation,
  GetProductsValidation,
  GetSingleProduct,
} = require("../validation/ProductValidation");
const expressValidationErrorHandler = require("../../middleware/expressValidationErrorHandler");
const genratePublicUrl = require("../../utils/genratePublicUrl");
const userAuthentication = require("../../middleware/userAuthentication");
const router = express.Router();

const CLIENT_RECORD_PER_PAGE = process.env.CLIENT_RECORD_PER_PAGE;
const PRODUCT_URL = `/images/product`;

// router.use(userAuthentication);

// Get FilterData
router.post(
  "/getfilter",
  userAuthentication,
  GetFilterValidation,
  expressValidationErrorHandler,
  asyncHandler(async (req, res) => {
    const { pc_ids } = req.body;

    var sqlCategory =
      "SELECT pc.pc_id , pc.category_name , COUNT(p.pc_id) as total_product FROM tblproductcategory pc RIGHT JOIN tblproduct p ON p.pc_id = pc.pc_id WHERE p.status = 1 GROUP BY p.pc_id;";

    var sqlColor =
      "SELECT c.color_id , c.color_name , COUNT(c.color_id) AS total_product FROM tblcolor c JOIN tblvariant v ON v.color_id = c.color_id JOIN tblproduct p ON p.product_id = v.product_id WHERE v.variant_status = 1 AND p.status = 1 ";
    var sqlSize =
      "SELECT s.size_id , s.size_name , COUNT(s.size_id) AS total_product FROM tblsize s JOIN tblvariant v ON v.size_id = s.size_id JOIN tblproduct p ON p.product_id = v.product_id WHERE v.variant_status = 1 AND p.status = 1  ";

    var minMax =
      "SELECT  MIN(v.sale_price) AS min , MAX(v.sale_price) AS max FROM tblvariant v JOIN tblproduct p ON p.product_id = v.product_id WHERE v.variant_status = 1 AND p.status = 1 ";

    if (pc_ids) {
      const ids = pc_ids.toString();
      sqlColor += ` AND p.pc_id IN (${ids}) `;
      sqlSize += ` AND p.pc_id IN (${ids}) `;
      minMax += ` AND p.pc_id IN (${ids}) `;
    }
    sqlColor += " GROUP BY c.color_id; ";
    sqlSize += " GROUP BY s.size_id; ";

    const [category] = await db.query(sqlCategory);
    const [color] = await db.query(sqlColor);
    const [size] = await db.query(sqlSize);
    const [[{ min, max }]] = await db.query(minMax);

    const sorting = [
      {
        name: "Alphabetically, A-Z",
        key: "ALPHA_ASC",
      },
      {
        name: "Alphabetically, Z-A",
        key: "ALPHA_DESC",
      },
      {
        name: "Price, low to high",
        key: "PRICE_ASC",
      },
      {
        name: "Price, high to low",
        key: "PRICE_DESC",
      },
      {
        name: "Date, old to new",
        key: "DATE_ASC",
      },
      {
        name: "Date, new to old",
        key: "DATE_DESC",
      },
    ];

    res.status(200).json({
      status: true,
      message: "Success",
      data: {
        category,
        size,
        color,
        priceRange: { min: +min, max: +max },
        sorting,
      },
    });
  })
);

router.post(
  "/getproducts",
  userAuthentication,
  GetProductsValidation,
  expressValidationErrorHandler,
  asyncHandler(async (req, res) => {
    var {
      query,
      pc_ids,
      color_ids,
      size_ids,
      sorting,
      price_range,
      page,
      per_page,
    } = req.body;
    per_page = per_page ? +per_page : +CLIENT_RECORD_PER_PAGE;
    const keyArr = [" p.status =  1 ", " v.variant_status = 1 "];
    const valueArr = [];
    let response = {
      status: true,
      message: "Success",
    };

    let sql =
      "SELECT p.product_id , p.product_title  , pc.category_name,  v.sale_price , v.price , img.image_array , COUNT(v.product_id) as total_variant , v.variant_id  FROM tblproduct p";

    sql += ` JOIN tblproductcategory pc ON pc.pc_id = p.pc_id `;
    sql += ` JOIN tblvariant v ON v.product_id = p.product_id `;
    sql += ` JOIN tblimages img ON img.image_id = v.image_id `;
    // sql += ` JOIN tblsize s ON s.size_id = v.size_id `;
    // sql += ` JOIN tblcolor c ON c.color_id = v.color_id `;

    if (pc_ids.length) {
      keyArr.push(` p.pc_id in(${pc_ids.toString()}) `);
      valueArr.push(pc_ids.toString());
    }
    if (color_ids.length) {
      keyArr.push(` v.color_id in(${color_ids.toString()}) `);
      valueArr.push(color_ids.toString());
    }

    if (size_ids.length) {
      keyArr.push(` v.size_id in(${size_ids.toString()}) `);
      valueArr.push(size_ids.toString());
    }

    if (query) {
      keyArr.push(
        `  ( p.product_title LIKE '%${query.trim()}%' OR p.product_desc LIKE '%${query.trim()}%' OR v.sku_id LIKE '%${query.trim()}%' ) `
      );
    }

    if (price_range.length) {
      keyArr.push(
        ` v.sale_price BETWEEN ${price_range[0]} AND ${price_range[1]} `
      );
    }
    if (keyArr.length) {
      sql += ` WHERE ${keyArr.join(" AND ")}`;
    }

    // sql += ` GROUP BY p.product_id `;
    sql += ` GROUP BY v.image_id `;

    if (sorting) {
      switch (sorting) {
        case "ALPHA_DESC":
          sql += ` ORDER BY p.product_title DESC`;
          break;
        case "ALPHA_ASC":
          sql += ` ORDER BY p.product_title `;
          break;

        case "PRICE_ASC":
          sql += ` ORDER BY v.sale_price `;
          break;
        case "PRICE_DESC":
          sql += ` ORDER BY v.sale_price DESC `;
          break;
        case "DATE_ASC":
          sql += ` ORDER BY p.created_date `;
          break;
        case "DATE_DESC":
          sql += ` ORDER BY p.created_date DESC `;
          break;

        default:
          break;
      }
    }

    // console.log("Query-->" , sql)
    // console.log(sql)
    const [data] = await db.query(sql, valueArr);
    const offset = (page - 1) * per_page;
    sql += `  LIMIT ${per_page} OFFSET ${offset} `;
    var totalPage = Math.ceil(data.length / per_page);

    let [rows, fields] = await db.execute(sql, valueArr);
    // rows = rows.map((item, i) => {
    //   return {
    //     ...item,
    //     image_array: genratePublicUrl(
    //       PRODUCT_URL,
    //       item.image_array
    //         ? JSON.parse(item.image_array)[0]
    //         : "default_product.png"
    //     ),
    //   };
    // });
    rows = rows.map((item, i) => {
      return {
        ...item,
        image_array: JSON.parse(item.image_array).map((item, i) => {
          return genratePublicUrl(PRODUCT_URL, item);
        }),
      };
    });
    res.status(200).json({
      ...response,
      result: {
        data: rows,
        perPage: +per_page,
        totalPage,
      },
    });
  })
);

router.get(
  "/:variant_id",
  userAuthentication,
  GetSingleProduct,
  expressValidationErrorHandler,
  asyncHandler(async (req, res) => {
    // TODO: Variant status and product status is Pending.............
    const uid = req?.user?.id;
    const { variant_id } = req.params;
    // "SELECT p.* , v.* FROM tblvariant v JOIN tblproduct p ON v.product_id = p.product_id  WHERE v.variant_id = ? ";
    var product_sql =
      "SELECT p.* , v.* ,  af.name as fabric_name , ast.name as style_name , ao.name as occasion_name , im.image_array , pc.category_name  FROM tblvariant v";
    product_sql += " JOIN tblproduct p ON v.product_id = p.product_id  ";
    product_sql += " LEFT JOIN tblimages im ON im.image_id = v.image_id  ";
    product_sql += " JOIN tblcolor c ON v.color_id = c.color_id  ";
    product_sql += " JOIN tblproductcategory pc ON p.pc_id = pc.pc_id  ";
    product_sql += " JOIN tblsize s ON v.size_id = s.size_id  ";
    product_sql += ` LEFT JOIN attributes af ON af.id = p.fabric `;
    product_sql += ` LEFT JOIN attributes ast ON ast.id = p.style `;
    product_sql += ` LEFT JOIN attributes ao ON ao.id = p.occasion `;
    product_sql += "  WHERE v.variant_id = ? AND v.variant_status= 1  ";
    // console.log(product_sql)
    var [product_details] = await db.query(product_sql, [variant_id]);
    // console.log(product_details)
    product_details[0].image_array = product_details[0].image_array
      ? JSON.parse(product_details[0].image_array)
      : ["default_product.png"];
    // console.log(product_details[0].image_array);
    product_details[0].image_array = product_details[0].image_array.map(
      (item, i) => {
        return genratePublicUrl(PRODUCT_URL, item);
      }
    );
    var color_sql =
      "SELECT v.variant_id  , v.size_id ,  s.size_name , v.stock  FROM tblvariant v  ";
    color_sql += " JOIN tblcolor c ON v.color_id = c.color_id  ";
    color_sql += " JOIN tblsize s ON v.size_id = s.size_id  ";
    color_sql +=
      "  WHERE v.product_id = ?  AND  v.color_id = ? AND v.variant_status= 1   ORDER BY s.created_date DESC";

    var size_sql =
      "SELECT v.variant_id , v.color_id , c.color_name , v.stock  FROM tblvariant v  ";
    size_sql += " JOIN tblcolor c ON v.color_id = c.color_id  ";
    size_sql += " JOIN tblsize s ON v.size_id = s.size_id  ";
    size_sql +=
      "  WHERE v.product_id = ?  AND  v.size_id = ? AND v.variant_status= 1  ORDER BY c.created_date DESC";

    // console.log(color_sql);
    const [color_details] = await db.query(color_sql, [
      product_details[0].product_id,
      product_details[0].color_id,
    ]);

    const [size_details] = await db.query(size_sql, [
      product_details[0].product_id,
      product_details[0].size_id,
    ]);

    const data = {
      ...product_details[0],
      color_variant: size_details,
      size_variant: color_details,
    };
    // const data = { ...product_details[0] };
    // console.log(sql);
    res.status(200).json({
      message: "Success",
      status: true,
      data,
      // variant_details,
    });
  })
);

module.exports = router;
