const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  updateUserProfile,
  deleteUserProfile,
} = require("../controllers/userController");
const router = express.Router();

// Routes here
router.put("/profile/update", authMiddleware, updateUserProfile);
router.delete("/profile/delete", authMiddleware, deleteUserProfile);

module.exports = router;
