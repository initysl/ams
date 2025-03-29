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
const { validate } = require("../models/User");
const router = express.Router();

// Routes here
router.get("/profile/me", authMiddleware, getUserProfile);
router.put(
  "/profile/update",
  authMiddleware,
  validateProfileUpdate,
  updateUserProfile
);
router.delete("/profile/delete", authMiddleware, deleteUserProfile);

module.exports = router;
