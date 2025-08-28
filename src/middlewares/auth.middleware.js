import { db } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const verifyJWT = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new ApiError(400, "Unauthorized!");
    }

    const decodedToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
    );

    const user = await db.user.findFirst({
      where: {
        id: decodedToken.id,
      },
    });

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Problem while verifying user");
  }
};

const checkApiKey = async (req, res, next) => {
  try {
    const key = req.header("Authorization")?.replace("Bearer ", "") || "";

    if (!key) {
      throw new ApiError(401, "Unauthorized - missing api key");
    }

    const apiKey = await db.apiKey.findFirst({
      where: {
        key,
        createdBy: req?.user?.id,
      },
    });

    if (!apiKey) {
      throw new ApiError(401, "Invalid api key");
    }

    if (apiKey.endedAt && new Date(apiKey.endedAt) < new Date()) {
      throw new ApiError(403, "Api key expired");
    }

    next();
  } catch (error) {
    throw new ApiError(500, error?.message || "Problem while checking api key");
  }
};

const checkRole = (role) => async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!role?.includes(user.role)) {
      throw new ApiError(403, `Access denied - ${String(role).toLowerCase()} only`);
    }

    next();
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Problem while checking role",
    );
  }
};

export { verifyJWT, checkApiKey, checkRole };
