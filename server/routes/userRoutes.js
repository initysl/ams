const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  updateUserProfile,
  deleteUserProfile,
} = require("../controllers/userController");
const router = express.Router();

// Routes here
router
  .route("/profile")
  .put(authMiddleware, updateUserProfile)
  .delete(authMiddleware, deleteUserProfile);

module.exports = router;
