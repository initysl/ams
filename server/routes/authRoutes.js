const express = require("express");
const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  validateRegistration,
  validateLogin,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

router.post("/register", register, validateRegistration);
router.post("/login", login, validateLogin, authMiddleware);

module.exports = router;
