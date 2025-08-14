const express = require("express");
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
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
const { upload, uploadToCloudinary } = require("../utils/multerConfig");

const router = express.Router();

// Ensure to remove uneccessary authMiddleware
router.post(
  "/register",
  upload.single("profilePicture"),
  validateRegistration,
  async (req, res, next) => {
    try {
      if (req.file) {
        const result = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
        req.body.profilePicture = result.secure_url; // Add the Cloudinary URL to req.body
      }
      next(); // Continue to your register function
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  register
);
router.post("/login", validateLogin, loginLimiter, login);
router.get("/verify-email", verifyEmail);
router.post("/logout", authMiddleware, logout);
router.post("/recover", forgotPassword);
router.post("/validate", validateResetToken);
router.post("/reset", resetPassword);

module.exports = router;
