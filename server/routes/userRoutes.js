const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  updateUserProfile,
  deleteUserProfile,
} = require("../controllers/userController");
const router = express.Router();

// Routes here
router.put("/update-profile", updateUserProfile, authMiddleware);
router.delete("/delete-profile", deleteUserProfile, authMiddleware);

module.exports = router;
