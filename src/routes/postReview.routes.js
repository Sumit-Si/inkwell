import { Router } from "express";
import {
  verifyJWT,
  checkRole,
  checkApiKey,
} from "../middlewares/auth.middleware.js";
import {
  approvePost,
  getPendingPosts,
  rejectPost,
} from "../controller/postReview.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  approvePostValidator,
  rejectPostValidator,
} from "../validators/index.js";

const router = Router();

router
  .route("/")
  .get(verifyJWT, checkRole("ADMIN"), checkApiKey, getPendingPosts);

router
  .route("/:id/approve")
  .put(
    verifyJWT,
    checkRole("ADMIN"),
    checkApiKey,
    approvePostValidator(),
    validate,
    approvePost,
  );

router
  .route("/:id/reject")
  .put(
    verifyJWT,
    checkRole("ADMIN"),
    checkApiKey,
    rejectPostValidator(),
    validate,
    rejectPost,
  );

export default router;
