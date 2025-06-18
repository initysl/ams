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
    .optional({ nullable: true, checkFalsy: true }) // FIXED: Allow empty/null values
    .customSanitizer((value) => {
      // FIXED: Return null for empty values instead of empty string
      if (!value || value.trim() === "") return null;
      return value.trim().replace(/\s+/g, "");
    })
    .custom((value) => {
      // FIXED: Only validate if value exists and is not null
      if (value !== null && value !== undefined) {
        if (!/^[A-Za-z0-9/]+$/.test(value)) {
          throw new Error("Matric number contains invalid characters");
        }
        if (value.length < 10) {
          throw new Error("Matric number must be at least 10 characters long");
        }
      }
      return true;
    }),

  check("department")
    .exists()
    .customSanitizer((value) => (value ? value.trim() : ""))
    .isLength({ min: 3 })
    .withMessage("Department must be at least 3 characters long"),

  check("password")
    .exists()
    .customSanitizer((value) => (value ? value.trim() : ""))
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

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
    .customSanitizer((value) => (value ? value.trim() : ""))
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
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
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
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
