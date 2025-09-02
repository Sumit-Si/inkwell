import { Router } from "express";
import {
  generateApiKey,
  getCommentsByUserId,
  login,
  profile,
  register,
} from "../controller/auth.controller.js";
import {
  loginPostRequestValidator,
  registerPostRequestValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import { checkApiKey, verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadUserProfile } from "../middlewares/multer.middleware.js";
import {
  handleFileUploadError,
  validateUploadedFile,
} from "../middlewares/fileUpload.middleware.js";

const router = Router();

// register user route
router
  .route("/register")
  .post(
    registerPostRequestValidator(),
    validate,
    uploadUserProfile.single("profileImage"),
    (req,res,next) => {if(req.file) validateUploadedFile
      next();
    },
    (req,res,next) => {if(req.file) handleFileUploadError
      next();
    },
    register,
  );

// login user route
router.route("/login").post(loginPostRequestValidator(), validate, login);

// create api key route - [Protected]
router.route("/api-key").post(verifyJWT, generateApiKey);

// profile route - [Protected]
router.route("/me").get(verifyJWT, profile);

// TODO: comment route
router
  .route("/:userId/comments")
  .get(verifyJWT, checkApiKey, getCommentsByUserId);

export default router;
