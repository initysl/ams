const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} = require("../controllers/userController");
const {
  validateProfileUpdate,
} = require("../middlewares/validationMiddleware");
const upload = require("../utils/upload");

const router = express.Router();

// GET user profile
router.get("/profile/me", authMiddleware, getUserProfile);

// PUT update profile with upload and validation
router.put(
  "/profile/update",
  authMiddleware,
  upload.single("profilePicture"),
  validateProfileUpdate,
  updateUserProfile
);

// DELETE user profile
router.delete("/profile/delete", authMiddleware, deleteUserProfile);

module.exports = router;
