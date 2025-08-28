import { Router } from "express";
import {
  verifyJWT,
  checkRole,
  checkApiKey,
} from "../middlewares/auth.middleware.js";
import {
  addCategory,
  getCategories,
} from "../controller/category.controller.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, checkApiKey, checkRole("ADMIN"), addCategory)
  .get(verifyJWT, checkApiKey, getCategories);

export default router;
