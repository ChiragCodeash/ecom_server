const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const db = require("../../db/db");
const expressValidationErrorHandler = require("../../middleware/expressValidationErrorHandler");
const genratePublicUrl = require("../../utils/genratePublicUrl");
const userAuthentication = require("../../middleware/userAuthentication");
const { AddToCartValidation } = require("../validation/CartValidation");
const router = express.Router();

const CLIENT_RECORD_PER_PAGE = process.env.CLIENT_RECORD_PER_PAGE;
const PRODUCT_URL = `/images/product`;

router.use(userAuthentication);

// Add To Cart
router.post(
  "/addtocart",
  AddToCartValidation,
  expressValidationErrorHandler,
  asyncHandler(async (req, res) => {
    const { variant_id, qty } = req.body;
    const { id } = req.user;
    const [isExits] = await db.query(
      "SELECT * FROM cart WHERE uid = ? AND variant_id = ?",
      [id, variant_id]
    );
    var cartData;
    if (isExits.length) {
      const cartId = isExits[0].id;
      [cartData] = await db.query("UPDATE cart SET qty = ? WHERE id = ? ", [
        qty,
        cartId,
      ]);
    } else {
      [cartData] = await db.query(
        "INSERT INTO `cart`(`uid`, `variant_id`, `qty`) VALUES (?,?,?)",
        [id, variant_id, qty]
      );
    }
    if (cartData.affectedRows) {
      res.status(200).json({
        status: true,
        message: "Added to cart",
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Something went wrong",
      });
    }
  })
);

// Get Cart Data
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    var sql =
      " SELECT c.* , im.image_array , p.product_title , s.size_name , co.color_name , v.sale_price , v.price , SUM(c.qty * v.sale_price) as subtotal FROM cart c  ";
    sql += " JOIN tblvariant v ON v.variant_id = c.variant_id ";
    sql += " JOIN tblproduct p ON p.product_id = v.product_id ";
    sql += " JOIN tblimages im ON im.image_id = v.image_id ";
    sql += " JOIN tblcolor co ON co.color_id = v.color_id ";
    sql += " JOIN tblsize s ON s.size_id = v.size_id ";
    sql += " WHERE uid = ? GROUP BY c.id ";

    // console.log(sql)
    var [cartData] = await db.query(sql, [id]);
    var total_price = cartData.reduce((acc, item) => {
      return acc + item.price * item.qty;
    }, 0);
    var total_sale_price = cartData.reduce((acc, item) => {
      return acc + item.sale_price * item.qty;
    }, 0);
    cartData = cartData.map((item, i) => {
      return {
        ...item,
        image_array: JSON.parse(item.image_array).map((item, i) => {
          return genratePublicUrl(PRODUCT_URL, item);
        }),
      };
    });
    //  console.log(total_price)
    res.status(200).json({
      status: true,
      message: "Success",
      result: { data: cartData, total_price, total_sale_price , save : total_price - total_sale_price },
    });
  })
);

module.exports = router;
