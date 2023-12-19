const express = require("express");
const {
  signUp,
  activateAccount,
  login,
  logout,
} = require("../controller/user-controller");
const isLogin = require("../lib/middleware/auth-middleware");
const router = express.Router();

router.post("/signup", signUp);
router.get("/activate-account", activateAccount);
router.post("/login", login);
router.delete("/logout", isLogin, logout);

module.exports = router;
