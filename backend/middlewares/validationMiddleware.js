import { body, validationResult } from "express-validator";

/**
 * Reusable middleware to check for validation errors
 * and return a standardized error response.
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for user registration.
 */
export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[a-zA-Z]/)
    .withMessage("Password must contain at least one letter"),

  body("role")
    .isIn(["student", "recruiter"])
    .withMessage("Role must be student or recruiter"),

  handleValidationErrors,
];

/**
 * Validation rules for user login.
 */
export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  body("role")
    .isIn(["student", "recruiter", "admin"])
    .withMessage("Role must be student, recruiter, or admin"),

  handleValidationErrors,
];

/**
 * Validation rules for posting job listings.
 */
export const validateJobCreate = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Job title must be between 3 and 100 characters"),

  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required"),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters long"),

  handleValidationErrors,
];
