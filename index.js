const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetchUser = require("./src/middleware/fetchUser");
const commonFunction = require("./src/middleware/commonFunction");
const path = require('path');
const errorHandler = require("./src/middleware/errorHandler");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).json({
    status: true,
  });
});
// app.get('/read-cookie', (req, res) => {
//   const token = req.cookies.token;
//   res.send(`Cookie retrieved: ${token}`);
// });
// app.get('/set-cookie', (req, res) => {
//   // Set a cookie named 'token' with value '123456'
//   // 'httpOnly' ensures the cookie is accessible only by the web server
//   // 'secure' ensures the cookie is sent only over HTTPS (for production)
//   // 'maxAge' sets the cookie expiration in milliseconds (e.g., 1 day)
//   res.cookie('token', '123456', { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });
//   res.send('Cookie has been set');
// });

const jsonErrorHandler = (err, req, res, next) => {
  res
    .status(500)
    .send({ status: false, message: "Please enter valid JSON data" });
};
app.use(jsonErrorHandler);
app.use(commonFunction)

// Frontend -------------------------------------------------------------------
app.use("/api/theme" ,  require("./src/frontend/routes/theme"),errorHandler);
app.use("/api/auth", require("./src/frontend/routes/authentication") , errorHandler);
app.use("/api/profile", require("./src/frontend/routes/profile") , errorHandler);
app.use("/api/product", require("./src/frontend/routes/product") , errorHandler);

// Backend -------------------------------------------------------------------
app.use("/auth", require("./src/backend/routes/auth"));
app.use("/category", require("./src/backend/routes/ProductCategory"));
app.use("/product", fetchUser, require("./src/backend/routes/Product"));
// app.use("/colorandsize", require("./src/backend/routes/ColorAndSize"));
app.use("/attributes", require("./src/backend/routes/Attributes"));
app.use("/image", require("./src/backend/routes/handleImage"));
// app.use("/size", require("./src/backend/routes/Size"))

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
