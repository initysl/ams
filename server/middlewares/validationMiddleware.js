const { check } = require("express-validator");

// Registration Validation
const validateRegistration = [
  check("name")
    .exists()
    .customSanitizer((value) => (value ? value.trim() : ""))
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters long"),
  check("email").exists().trim().isEmail().withMessage("Invalid email address"),
  check("matricNumber")
    .optional()
    .customSanitizer((value) => (value ? value.trim().replace(/\s+/g, "") : ""))
    .matches(/^[A-Za-z0-9/]+$/)
    .isLength({ min: 10 })
    .withMessage("Matric number must be at least 10 characters long"),
  check("department")
    .exists()
    .customSanitizer((value) => (value ? value.trim() : ""))
    .isLength({ min: 3 })
    .withMessage("Department must be at least 3 characters long"),
  check("password")
    .exists()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((value) => {
      // Allow all printable characters, just check it's not empty after trim
      if (!value || value.trim().length === 0) {
        throw new Error("Password cannot be empty");
      }
      return true;
    }),
  check("confirmPassword")
    .exists()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

// Login Validation
const validateLogin = [
  check("email").exists().isEmail().withMessage("Invalid email address"),
  check("password")
    .exists()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((value) => {
      if (!value || value.trim().length === 0) {
        throw new Error("Password cannot be empty");
      }
      return true;
    }),
];

// Session ID Validation
const validateSessionId = [
  check("sessionId")
    .exists()
    .customSanitizer((value) => (value ? value.replace(/\s+/g, "") : ""))
    .isMongoId()
    .withMessage("Invalid session ID"),
];

// Profile Update Validation
const validateProfileUpdate = [
  check("name")
    .optional()
    .customSanitizer((value) => (value ? value.trim() : ""))
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters long"),
  check("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),
  check("matricNumber")
    .optional()
    .customSanitizer((value) => (value ? value.trim().replace(/\s+/g, "") : ""))
    .matches(/^[A-Za-z0-9/]+$/)
    .isLength({ min: 10 })
    .withMessage("Matric number must be at least 10 characters long"),
  check("department")
    .optional()
    .customSanitizer((value) => (value ? value.trim() : ""))
    .isLength({ min: 3 })
    .withMessage("Department must be at least 3 characters long"),
  check("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((value) => {
      if (value && value.trim().length === 0) {
        throw new Error("Password cannot be empty");
      }
      return true;
    }),
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateSessionId,
  validateProfileUpdate,
};
