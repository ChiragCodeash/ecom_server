const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetchUser = require("./src/middleware/fetchUser");


const app = express();
require("dotenv").config();
const PORT = 4000;
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).json({
    status: true,
  });
});



const jsonErrorHandler = (err, req, res, next) => {
  res.status(500).send({ status: false , message : "Please enter valid JSON data" });
}
app.use(jsonErrorHandler)


// Frontend -------------------------------------------------------------------
app.use("/theme", require("./src/frontend/routes/theme"))


// Backend -------------------------------------------------------------------
app.use("/auth", require("./src/backend/routes/auth"))
app.use("/category", require("./src/backend/routes/ProductCategory"))
app.use("/product", fetchUser, require("./src/backend/routes/Product"))
app.use("/colorandsize", require("./src/backend/routes/ColorAndSize"))
// app.use("/size", require("./src/backend/routes/Size"))

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
