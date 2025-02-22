const { check } = require("express-validator");

// Registration Validation Middleware
const validateRegistration = [
  check("name")
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters long"),

  check("email").isEmail().withMessage("Invalid email address"),

  check("matricNumber")
    .matches(/^[A-Za-z0-9/]+$/)
    .withMessage("Invalid matric number format"),

  check("department")
    .isLength({ min: 3 })
    .withMessage("Department must be at least 3 characters long"),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Login Validation Middleware
const validateLogin = [
  check("email").isEmail().withMessage("Invalid email address"),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

module.exports = {
  validateRegistration,
  validateLogin,
};
