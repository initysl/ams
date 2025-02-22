const express = require("express");
const {
  register,
  login,
  verifyEmail,
  logout,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  validateRegistration,
  validateLogin,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, authMiddleware, login);
router.get("/verify-email", verifyEmail);
router.post("/logout", authMiddleware, logout);

module.exports = router;
