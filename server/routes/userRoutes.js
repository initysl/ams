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
const { upload, uploadToCloudinary } = require("../utils/multerConfig");

const router = express.Router();

// GET user profile
router.get("/profile/me", authMiddleware, UserProfile);

// PUT update profile with upload and validation
router.put(
  "/profile/update",
  authMiddleware,
  upload.single("profilePicture"),
  validateProfileUpdate,
  async (req, res, next) => {
    try {
      if (req.file) {
        const result = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
        req.body.profilePicture = result.secure_url;
      }
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  updateUserProfile
);

// DELETE user profile
router.delete("/profile/delete", authMiddleware, deleteUserProfile);

// POST feedback
router.post("/feedback", authMiddleware, userFeedback);

module.exports = router;
