const express = require("express");
const router = express.Router();
const db = require("../../db/db");
const fetchUser = require("../../middleware/fetchUser");
const { validationResult } = require("express-validator");
const deleteFile = require("../../utils/deleteFile");
const multer = require("multer");
const {
  UploadImagesValidation,
  DeleteImageValidation,
  UpdateImageValidation,
} = require("../validation/ImageValidation");
const saveFile = require("../../utils/saveFile");
const genratePublicUrl = require("../../utils/genratePublicUrl");
const expressValidationErrorHandler = require("../../middleware/expressValidationErrorHandler");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// const PRODUCT_URL = `${process.env.URL}/images/product`;
const PRODUCT_URL = `/images/product`;

router.use(fetchUser);
// Upload Product Image
router.post(
  "/uploadimages",
  upload.any(),
  UploadImagesValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    const status = false;
    try {
      let image_id;
      const { product_id, color_id } = req.body;
      const files = req.files;
      const [is_added] = await db.query(
        "SELECT * FROM tblimages WHERE product_id = ? AND color_id = ?",
        [product_id, color_id]
      );
      var response;
      if (is_added.length) {
        const img_arr = saveFile(PRODUCT_URL, files);
        image_id = is_added[0].image_id;
        var old_image = JSON.parse(is_added[0].image_array);
        var [data] = await db.query(
          "UPDATE `tblimages` SET `product_id`=?,`color_id`=?,`image_array`=? WHERE image_id = ?",
          [
            product_id,
            color_id,
            JSON.stringify([...old_image, ...img_arr]),
            image_id,
          ]
        );

        response = {
          ...is_added[0],
          image_array: [...old_image, ...img_arr],
        };
      } else {
        var img_arr = saveFile(PRODUCT_URL, files);
        var [data] = await db.query(
          "INSERT INTO `tblimages`(`product_id`, `color_id`, `image_array`) VALUES (?,?,?)",
          [product_id, color_id, JSON.stringify(img_arr)]
        );
        image_id = data.insertId;
        response = {
          image_id: data.insertId,
          image_array: img_arr,
          product_id: +product_id,
          color_id: +color_id,
        };
      }

      await db.query(
        "UPDATE tblvariant SET image_id = ? WHERE color_id = ? AND product_id = ?",
        [image_id, color_id, product_id]
      );

      response.image_array = response.image_array.map((element, i) => {
        return genratePublicUrl(`${PRODUCT_URL}`, element);
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
      res.status(400).json({
        status,
        message: "server error",
      });
    }
  }
);

// Delete Product Image
router.post(
  "/deleteimage",
  DeleteImageValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    try {
      const { index, image_id } = req.body;
      const { image } = req;
      const image_array = JSON.parse(image.image_array);
      const old_image = image_array[index];
      if (image_array.length > 1) {
        image_array.splice(index, 1);

        var [data] = await db.query(
          "UPDATE tblimages SET image_array = ? WHERE image_id =?",
          [JSON.stringify(image_array), image_id]
        );
      } else {
        [data] = await db.query("DELETE FROM tblimages  WHERE image_id =?", [
          image_id,
        ]);
      }
      if (data.affectedRows) {
        deleteFile(PRODUCT_URL, [old_image]);
        res.status(200).json({
          status: true,
          message: "Image delete success",
        });
      } else {
        res.status(400).json({
          status: false,
          message: "Unable to delete image",
        });
      }
    } catch (error) {
      console.log("🚀 ~ router.get ~ error:", error);
      res.status(400).json({
        status: false,
        message: "server error",
      });
    }
  }
);

// Update Product Image
router.post(
  "/updateimages",
  upload.any(),
  UpdateImageValidation,
  expressValidationErrorHandler,
  async (req, res) => {
    const status = false;
    try {
      const { index, image_id } = req.body;
      const { image } = req;
      const files = req.files;
      const image_array = JSON.parse(image.image_array);
      const old_image = image_array[index];

      var new_img = saveFile(PRODUCT_URL, files);
      image_array[index] = new_img[0];
      var [data] = await db.query(
        "UPDATE tblimages SET image_array = ? WHERE image_id =?",
        [JSON.stringify(image_array), image_id]
      );

      if (data.affectedRows) {
        deleteFile(PRODUCT_URL, [old_image]);
        res.status(200).json({
          status: true,
          message: "Image Update success",
          data: {
            filename: genratePublicUrl(PRODUCT_URL, new_img),
          },
        });
      } else {
        res.status(400).json({
          status: false,
          message: "Unable to update image",
        });
      }
    } catch (error) {
      console.log("🚀 ~ router.get ~ error:", error);
      res.status(400).json({
        status,
        message: "server error",
      });
    }
  }
);

module.exports = router;
