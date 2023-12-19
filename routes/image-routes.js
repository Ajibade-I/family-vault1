const express = require("express");
const { uploadImage, viewImages } = require("../controller/image-controller");
const isLogin = require("../lib/middleware/auth-middleware");

const router = express.Router();

router.post("/upload", isLogin, uploadImage);
router.get("/view", isLogin, viewImages);

module.exports = router;
