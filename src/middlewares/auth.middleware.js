import { db } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const verifyJWT = async (req,res,next) => {
    try {
        const {accessToken} = req.cookies;

    if(!accessToken) {
        throw new ApiError(400, "Unauthorized!");
    }

    const decodedToken = jwt.verify(accessToken,
        process.env.ACCESS_TOKEN_SECRET,
    );

    const user = await db.user.findFirst({
        where: {
            id: decodedToken.id,
        }
    })

    if(!user) {
        throw new ApiError(401, "Unauthorized")
    }

    req.user = decodedToken;

    next()
    } catch (error) {
        throw new ApiError(401, error?.message ||  "Problem while verifying user");
    }
    
}


export {
    verifyJWT,
}