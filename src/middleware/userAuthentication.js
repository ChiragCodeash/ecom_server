const jwt = require("jsonwebtoken");

const userAuthentication = (req, res, next) => {
  const secretKey = process.env.JWT_FRONTEND_KEY;
  const token = req.headers.token
  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(400).json({
          status: false,
          message: "Authentication Failed",
          logout : true
        });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(400).json({
        status: false,
        message: "Authentication Failed",
        logout : true
      });
  }
};

module.exports = userAuthentication;
