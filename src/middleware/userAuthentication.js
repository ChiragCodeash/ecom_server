const jwt = require("jsonwebtoken");

const ALLOW_LIST = ["/api/product"];
const userAuthentication = (req, res, next) => {
  // console.log(req.originalUrl)
  // console.log(req.baseUrl)
  const secretKey = process.env.JWT_FRONTEND_KEY;
  const BASE_URL = req.baseUrl;
  const token = req.headers.token;
  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(400).json({
          status: false,
          message: "Authentication Failed",
          logout: true,
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    if (ALLOW_LIST.includes(BASE_URL)) {
      next();
    } else {
      res.status(400).json({
        status: false,
        message: "Authentication Failed",
        logout: true,
      });
    }
  }
};

module.exports = userAuthentication;
