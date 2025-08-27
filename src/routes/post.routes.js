import { Router } from "express";
import { checkApiKey, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPost,
  deletePostById,
  getPosts,
  getPublishedPostById,
  updatePostById,
} from "../controller/post.controller.js";

const router = Router();

router.route("/").post(verifyJWT, checkApiKey, createPost).get(getPosts); // public

router
  .route("/:id")
  .get(verifyJWT, checkApiKey, getPublishedPostById)
  .put(verifyJWT, checkApiKey, updatePostById)
  .delete(verifyJWT, checkApiKey, deletePostById);

export default router;
