import { Router } from "express";
import { checkApiKey, checkRole, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPost,
  deletePostById,
  getPosts,
  getPublishedPostById,
  updatePostById,
} from "../controller/post.controller.js";
import { createPostValidator, updatePostValidator } from "../validators/index.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, checkApiKey,createPostValidator(),validate, createPost).get(getPosts); // public

router
  .route("/:id")
  .get(verifyJWT, checkApiKey, getPublishedPostById)
  .put(verifyJWT,checkRole("USER"), checkApiKey, updatePostValidator(),validate, updatePostById)
  .delete(verifyJWT,checkRole("USER"), checkApiKey, deletePostById);

export default router;
