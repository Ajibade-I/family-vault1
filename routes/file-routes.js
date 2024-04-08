const express = require("express");
const upload = require("../lib/multer");
const {
  uploadFile,
  viewMyfiles,
  deleteFile,
  updateFile,
  downloadFile,
} = require("../controller/file-controller");
const isLogin = require("../lib/middleware/auth-middleware");
const router = express.Router();

router.post("/upload", isLogin, upload.any(), uploadFile);
router.get("/", isLogin, viewMyfiles);
router.get("/download/:fileId", isLogin, downloadFile);
router.delete("/delete/:fileId", isLogin, deleteFile);
router.post("/edit/:fileId", isLogin, updateFile);

module.exports = router;
