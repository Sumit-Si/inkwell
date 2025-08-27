import { Router } from "express";
import {
  verifyJWT,
  checkAdmin,
  checkApiKey,
} from "../middlewares/auth.middleware.js";
import {
  addCategory,
  getCategories,
} from "../controller/category.controller.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, checkApiKey, checkAdmin, addCategory)
  .get(verifyJWT, checkApiKey, getCategories);

export default router;
