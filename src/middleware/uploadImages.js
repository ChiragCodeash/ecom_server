const multer = require("multer");
const path = require("path");

const uploadImage = (options) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, options.destination);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
      cb(
        null,
        options.filenamePrefix +
          "_" +
          uniqueSuffix +
          "." +
          file.mimetype.split("/")[1]
      );
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = options.allowedTypes || /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Upload only .jpg, .jpeg and .png in product image"));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: options.maxSize || 1024 * 1024 * 5,
    },
  });

  const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(200).json({ status: false, message: err.message });
    } else if (err) {
      return res.status(500).json({ status: false, message: err.message });
    }

    next();
  };

  return [upload.array(options.fieldName || "images"), handleUploadErrors];
};

module.exports = uploadImage;
