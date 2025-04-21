const express = require("express");
const {
  register,
  login,
  verifyEmail,
  resetPassword,
  forgotPassword,
  logout,
} = require("../controllers/authController");
const {
  authMiddleware,
  loginLimiter,
} = require("../middlewares/authMiddleware");
const {
  validateRegistration,
  validateLogin,
} = require("../middlewares/validationMiddleware");
const upload = require("../utils/multerConfig");

const router = express.Router();

// Ensure to remove uneccessary authMiddleware
router.post(
  "/register",
  upload.single("profilePicture"),
  validateRegistration,
  register
);
router.post("/login", validateLogin, loginLimiter, login);
router.get("/verify-email", verifyEmail);
router.post("/logout", authMiddleware, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", authMiddleware, resetPassword);

module.exports = router;
