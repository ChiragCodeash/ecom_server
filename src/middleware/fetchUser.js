const jwt = require("jsonwebtoken");

const fetchUser = (req, res, next) => {
  const secretKey = process.env.JWT_ADMIN_KEY;
  const { token } = req.headers;
  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.status(400).json({
          status: false,
          message: "Unauthorized user",
        });
      } else {
        res.user = decoded.uid;
        next();
      }
    });
  } else {
    res.status(400).json({
      status: false,
      message: "Unauthorized user",
    });
  }
};

module.exports = fetchUser;
