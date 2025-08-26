import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";
import { db } from "../db/index.js";
import {randomBytes} from "crypto";

const generateAccessAndRefreshToken = async (user) => {
    const accessToken = jwt.sign(
        {id: user?.id},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )

    const refreshToken = jwt.sign(
        {id: user?.id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )

    try {
        await db.user.update({
        where: {id: user?.id},
        data: {
            refreshToken,
        }
    })
    } catch (error) {
        throw new ApiError(400, "Problem while updating token");
    }
    
    return {accessToken,refreshToken}
}

const generateKey = () => {
    return randomBytes(32).toString("hex");
}

export {
    generateAccessAndRefreshToken,
    generateKey,
}