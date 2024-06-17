const fs = require("fs");
const commonFunction = (req, res, next) => {
  const path = ["./public/images/product"];
  path.map((item) => {
    if (!fs.existsSync(item)) {
      fs.mkdirSync(item, { recursive: true });
    }
  });
  next();
};

module.exports = commonFunction;
