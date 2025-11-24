import { body } from "express-validator";

// auth validations
const registerPostRequestValidator = () => {
  return [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be 3-50 characters")
      .toLowerCase()
      .withMessage("Username must be in lowercase")
      .matches(/^[a-zA-Z0-9\._]+$/)
      .withMessage("Username must contain only letters,dot, underscore and numbers"),

    body("fullName")
      .optional({ nullable: false })
      .trim()
      .isLength({ min: 5,max: 150 })
      .withMessage("FullName must be 5-150 characters"),

    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email id")
      .toLowerCase()
      .withMessage("Email must be in lowercase")
      .trim(),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 20 })
      .withMessage("Password must be 8-20 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[@$!%*?&#]/)
      .withMessage("Password must contain at least one special character"),

    body("role")
      .isIn(["USER", "ADMIN"])
      .withMessage("Role either be user or admin")
      .trim(),
  ];
};

const loginPostRequestValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email id")
      .trim(),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8,})
      .withMessage("Password must be at least 8 characters"),
  ];
};

// post validations
const createPostValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .isLength({ min: 5, max: 80 })
      .withMessage("Title should be 5-80 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description should be at least 10 characters")
      .isString()
      .withMessage("Description must be a string"),

    body("postedAt")
      .optional()
      .isISO8601()
      .withMessage("PostedAt must be a valid date")
      .toDate(),
  ];
};

const updatePostValidator = () => {
  return [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string")
      .isLength({ min: 5, max: 80 })
      .withMessage("Title should be 5-80 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description should be at least 10 characters")
      .isString()
      .withMessage("Description must be a string"),

    body("postedAt")
      .optional()
      .isISO8601()
      .withMessage("PostedAt must be a valid date")
      .toDate(),
  ];
};

// comment validations
const createCommentValidator = () => {
  return [
    body("message")
      .notEmpty()
      .withMessage("Message is required")
      .isString()
      .withMessage("Message must be a string")
      .isLength({ min: 3 })
      .withMessage("Message must be at least 3 characters")
      .isLowercase()
      .withMessage("Message must be in lowercase")
      .trim(),
  ];
};
const updateCommentValidator = () => {
  return [
    body("message")
      .notEmpty()
      .withMessage("Message is required")
      .isString()
      .withMessage("Message must be a string")
      .isLength({ min: 3 })
      .withMessage("Message must be at least 3 characters")
      .isLowercase()
      .withMessage("Message must be in lowercase")
      .trim(),
  ];
};

// postReview validations
const approvePostValidator = () => {
  return [
    body("rating")
      .optional()
      .trim()
      .isInt()
      .withMessage("Rating must be an int")
      .isIn([1, 2, 3, 4, 5])
      .withMessage("Rating between 1 to 5"),
    body("comment")
      .isString()
      .withMessage("Comment must be a string")
      .notEmpty()
      .withMessage("Comment is required")
      .isLowercase()
      .withMessage("Comment must be in lowercase")
      .trim(),
  ];
};

const rejectPostValidator = () => {
  return [
    body("rating")
      .optional()
      .trim()
      .isInt()
      .withMessage("Rating must an int")
      .isIn([1, 2, 3, 4, 5])
      .withMessage("Rating between 1 to 5"),
    body("comment")
      .isString()
      .withMessage("Comment must be a string")
      .optional()
      .isLowercase()
      .withMessage("Comment must be in lowercase")
      .trim(),
  ];
};

export {
  registerPostRequestValidator,
  loginPostRequestValidator,
  createPostValidator,
  updatePostValidator,
  createCommentValidator,
  updateCommentValidator,
  approvePostValidator,
  rejectPostValidator,
};
