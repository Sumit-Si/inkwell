import { Router } from "express";
import {
  checkApiKey,
  checkRole,
  verifyJWT,
} from "../middlewares/auth.middleware.js";
import {
  createComment,
  createPost,
  deleteCommentById,
  deletePostById,
  getCommentById,
  getComments,
  getPosts,
  getPublishedPostById,
  updateCommentById,
  updatePostById,
} from "../controller/post.controller.js";
import {
  createCommentValidator,
  createPostValidator,
  updatePostValidator,
} from "../validators/index.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadPostImage } from "../middlewares/multer.middleware.js";
import { handleFileUploadError, validateUploadedFile } from "../middlewares/fileUpload.middleware.js";

const router = Router();

router
  .route("/")
  .post(
    verifyJWT,
    checkApiKey,
    uploadPostImage.single("bannerImage"),
    (req, res, next) => {
      if (req.file) validateUploadedFile;
      next();
    },
    (req, res, next) => {
      if (req.file) handleFileUploadError;
      next();
    },
    createPostValidator(),
    validate,
    
    createPost,
  )
  .get(getPosts); // public

router
  .route("/:id")
  .get(verifyJWT, checkApiKey, getPublishedPostById)
  .put(
    verifyJWT,
    checkRole("USER"),
    checkApiKey,
    updatePostValidator(),
    validate,
    updatePostById,
  )
  .delete(verifyJWT, checkRole("USER"), checkApiKey, deletePostById);

// comment routes
router
  .route("/:postId/comments")
  .get(getComments)
  .post(
    verifyJWT,
    checkApiKey,
    createCommentValidator(),
    validate,
    createComment,
  ); // secured route

router
  .route("/:postId/comments/:id")
  .get(getCommentById)
  .put(verifyJWT, checkApiKey, updateCommentById)
  .delete(verifyJWT, checkApiKey, deleteCommentById);

export default router;
