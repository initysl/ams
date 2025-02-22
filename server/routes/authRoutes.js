const express = require("express");
const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  validateRegistration,
  validateLogin,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, authMiddleware, login);

module.exports = router;
