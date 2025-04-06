const { check } = require("express-validator");

// Registration Validation
const validateRegistration = [
  check("name")
    .customSanitizer((value) => value.trim().replace(/\s+/g, ""))
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters long"),

  check("email").trim().isEmail().withMessage("Invalid email address"),

  check("matricNumber")
    .customSanitizer((value) => value.trim().replace(/\s+/g, ""))
    .matches(/^[A-Za-z0-9/]+$/)
    .isLength({ min: 10 })
    .optional(),

  check("department")
    .customSanitizer((value) => value.trim().replace(/\s+/g, ""))
    .isLength({ min: 3 })
    .withMessage("Department must be at least 3 characters long"),

  check("password")
    .customSanitizer((value) => value.trim().replace(/\s+/g, ""))
    .matches(/^[A-Za-z0-9/]+$/)
    .withMessage("Password can only contain letters and numbers")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Login Validation
const validateLogin = [
  check("email").isEmail().withMessage("Invalid email address"),

  check("password")
    //trim()
    .customSanitizer((value) => value.replace(/\s+/g, ""))
    .matches(/^[A-Za-z0-9/]+$/)
    .withMessage("Password can only contain letters and numbers")
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

// Profile Update Validation
const validateProfileUpdate = [
  check("name")
    .optional()
    .customSanitizer((value) => value.trim().replace(/\s+/g, ""))
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters long"),

  check("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),

  check("matricNumber")
    .optional()
    .customSanitizer((value) => value.trim().replace(/\s+/g, ""))
    .matches(/^[A-Za-z0-9/]+$/)
    .isLength({ min: 10 })
    .withMessage("Matric number must be at least 10 characters long"),

  check("department")
    .optional()
    .customSanitizer((value) => value.trim().replace(/\s+/g, ""))
    .isLength({ min: 3 })
    .withMessage("Department must be at least 3 characters long"),

  check("password")
    .optional()
    //trim()
    .customSanitizer((value) => value.replace(/\s+/g, ""))
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateSessionId,
  validateProfileUpdate,
};
