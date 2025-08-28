import { Router } from "express";
import {
  generateApiKey,
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

const router = Router();

// register user route
router
  .route("/register")
  .post(registerPostRequestValidator(), validate, register);

// login user route
router.route("/login").post(loginPostRequestValidator(), validate, login);

// create api key route - [Protected]
router.route("/api-key").post(verifyJWT, generateApiKey);

// profile route - [Protected]
router.route("/me").get(verifyJWT, profile);

export default router;
