const express = require("express");
const {
  signUp,
  activateAccount,
  login,
  logout,
  forgotPassword,
  changePassword,
} = require("../controller/user-controller");
const isLogin = require("../lib/middleware/auth-middleware");
const router = express.Router();

router.post("/signup", signUp);
router.get("/activate-account", activateAccount);
router.post("/login", login);
router.delete("/logout", isLogin, logout);
router.put("/forgot-password", forgotPassword);
router.put("/change-password", isLogin, changePassword);

module.exports = router;
