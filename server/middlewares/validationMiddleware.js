const { check } = require("express-validator");

// Registration Validation
const validateRegistration = [
  check("name")
    //trim()
    // .customSanitizer((value) => value.replace(/\s+/g, ""))
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters long"),

  check("email").isEmail().withMessage("Invalid email address"),

  check("matricNumber")
    //trim()
    .customSanitizer((value) => value.replace(/\s+/g, ""))
    .matches(/^[A-Za-z0-9/]+$/)
    .isLength({ min: 10 })
    .optional(),

  check("department")
    //trim()
    .customSanitizer((value) => value.replace(/\s+/g, ""))
    .isLength({ min: 3 })
    .withMessage("Department must be at least 3 characters long"),

  check("password")
    //trim()
    .customSanitizer((value) => value.replace(/\s+/g, ""))
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Login Validation
const validateLogin = [
  check("email").isEmail().withMessage("Invalid email address"),

  check("password")
    //trim()
    .customSanitizer((value) => value.replace(/\s+/g, ""))
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Session ID Validation
const validateSessionId = [
  check("sessionId")
    //trim()
    .customSanitizer((value) => value.replace(/\s+/g, ""))
    .isMongoId()
    .withMessage("Invalid session ID"),
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateSessionId,
};
