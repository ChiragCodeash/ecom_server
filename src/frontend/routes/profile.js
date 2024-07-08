const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const expressValidationErrorHandler = require("../../middleware/expressValidationErrorHandler");
const db = require("../../db/db");
const userAuthentication = require("../../middleware/userAuthentication");
const {
  UpdateProfileValidation,
  UpdateAddressValidation,
} = require("../validation/ProfileValidation");
const router = express.Router();

router.use(userAuthentication);

// Profile  API
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const [[{ name, email, mno, status }]] = await db.query(
      "SELECT * FROM user WHERE uid = ? ",
      [id]
    );
    const [[address]] = await db.query(
      "SELECT * FROM addresses WHERE uid = ? ",
      [id]
    );

    res.json({
      status: true,
      message: "Success",
      data: {
        name,
        email,
        mno,
        status,
        address,
      },
    });
  })
);

// Update Profile
router.post(
  "/updateprofile",
  UpdateProfileValidation,
  expressValidationErrorHandler,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { name, mno } = req.body;
    let updateQuery = "UPDATE user  SET ";
    const updateKeyArr = [];
    const updateValueArr = [];
    var resData = {};

    if (name) {
      updateKeyArr.push(`name = ?`);
      updateValueArr.push(name);
      resData.name = name;
    }
    if (mno) {
      updateKeyArr.push(`mno = ?`);
      updateValueArr.push(mno);
      resData.mno = mno;
    }

    updateQuery += `${updateKeyArr.join(",")} WHERE uid = ?`;

    const [data] = await db.query(updateQuery, [...updateValueArr, id]);
    if (data.affectedRows) {
      res.status(200).json({
        status: true,
        message: "Changes saved",
        data: { ...resData },
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Something went wrong in update",
      });
    }
  })
);

router.post(
  "/updateadderss",
  UpdateAddressValidation,
  expressValidationErrorHandler,
  asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { line1, line2, pincode, state, city, area } = req.body;
    const [data] = await db.query("SELECT * FROM addresses WHERE uid = ? ", [
      id,
    ]);

    if (data.length) {
      var [isDone] = await db.query(
        "UPDATE addresses SET line1 = ?, line2 = ?,pincode = ?,state = ?,city = ?,area = ?  WHERE uid = ?",
        [line1, line2, pincode, state, city, area, id]
      );
    } else {
      [isDone] = await db.query(
        "INSERT INTO `addresses`(`uid`, `line1`, `line2`, `pincode`, `state`, `area`, `city`) VALUES (?,?,?,?,?,?,?)",
        [id, line1, line2, pincode, state, area, city]
      );
    }
    if (isDone.affectedRows) {
      res.status(200).json({
        status: true,
        message: "Changes saved",
        data: {
          line1,
          line2,
          pincode,
          state,
          city,
          area,
        },
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Something went wrong to update address",
      });
    }
  })
);

module.exports = router;
