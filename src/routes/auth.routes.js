import {Router} from "express"
import { generateApiKey, login, profile, register } from "../controller/auth.controller.js";


const router = Router();

// register user route
router
    .route("/register")
    .post(register)


// login user route
router
    .route("/login")
    .post(login)


// create api key route - [Protected]
router
    .route("/api-key")
    .post(generateApiKey)


// profile route - [Protected]
router
    .route("/me")
    .post(profile)

export default router;