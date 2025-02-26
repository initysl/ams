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

// Ensure to remove uneccessary authMiddleware
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.get("/verify-email", verifyEmail);
router.post("/logout", authMiddleware, logout);

module.exports = router;
