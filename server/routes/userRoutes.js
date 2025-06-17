const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  UserProfile,
  updateUserProfile,
  deleteUserProfile,
  userFeedback,
} = require("../controllers/userController");
const {
  validateProfileUpdate,
} = require("../middlewares/validationMiddleware");
const upload = require("../utils/multerConfig");

const router = express.Router();

// GET user profile
router.get("/profile/me", authMiddleware, UserProfile);

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

// POST feedback
router.post("/feedback", authMiddleware, userFeedback);

module.exports = router;
