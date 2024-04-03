const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const app = express();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Destination folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

// Initialize multer with configuration
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Express middleware to handle file upload
router.post('/upload', 
  // Express-validator middleware for validation
  [
    body('name').notEmpty(), // Example validation
  ],
  // Handler for file upload
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If validation passes, proceed to file upload
    upload.single('image')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: err.message });
      }

      // File uploaded successfully
      const name = req.body.name; // Accessing the text data
      const image = req.file; // Accessing the uploaded image
      return res.status(200).json({ message: 'File uploaded successfully', name: name, image: image });
    });
  }
);
module.exports = router;