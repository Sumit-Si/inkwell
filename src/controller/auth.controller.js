import { asyncHandler } from "../utils/asyncHandler.js";
import { db } from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword, isPasswordCorrect } from "../utils/hash.js";
import {
  generateAccessAndRefreshToken,
  generateKey,
} from "../utils/tokenGeneration.js";

const register = asyncHandler(async (req, res) => {
  const { username, email, password, fullName, role } = req.body;

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new ApiError(400, "User not exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await db.user.create({
    data: {
      username,
      email,
      fullName,
      password: hashedPassword,
      //   profileImage: "",
      role,
    },
  });

  const checkedUser = await db.user.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      username: true,
      email: true,
      fullName: true,
      role: true,
      profileImage: true,
    },
  });

  if (!checkedUser) {
    throw new ApiError(500, "Problem while creating user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, checkedUser, "User created successfully"));
});

const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const user = await db.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }

  const isMatch = await isPasswordCorrect(password, user);
  console.log("isMatch", isMatch ? "Yes" : "No");

  if (!isMatch) {
    throw new ApiError(400, "Invalid credientials");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);
  console.log(accessToken, refreshToken, "access and refresh");

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 10,
    })
    .json(
      new ApiResponse(200, {
        username: user?.username,
        email: user?.email,
        fullName: user?.fullName,
        role: user?.role,
        profileImage: user?.profileImage,
      }),
    );
});

const generateApiKey = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { endedAt } = req.body;

  const existingKey = await db.apiKey.findFirst({
    where: {
      createdBy: userId,
      status: "ACTIVE",
    },
  });

  if (
    existingKey &&
    (!existingKey.endedAt || new Date(existingKey.endedAt) > new Date())
  ) {
    throw new ApiError(400, "Active Key already exists");
  }

  if (new Date(existingKey?.endedAt) < new Date()) {
    try {
      await db.apiKey.update({
        where: {
          id: existingKey?.id,
        },
        data: {
          status: "INACTIVE",
        },
      });
    } catch (error) {
      throw new ApiError(
        500,
        error?.message || "Problem while deactivating apiKey",
      );
    }
  }

  const key = generateKey();
  console.log(key, "key");

  const apiKeyCreate = await db.apiKey.create({
    data: {
      key,
      createdBy: userId,
      endedAt: endedAt ? new Date(endedAt) : null,
    },
  });

  const createdApiKey = await db.apiKey.findUnique({
    where: {
      id: apiKeyCreate?.id,
    },
    select: {
      key: true,
      createdBy: true,
      user: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
  });

  if (!createdApiKey) {
    throw new ApiError(500, "Problem while creating api key");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdApiKey, "Api key created successfully"));
});

const profile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      username: true,
      email: true,
      fullName: true,
      role: true,
      profileImage: true,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

const getCommentsByUserId = asyncHandler(async (req, res) => {});

export { register, login, generateApiKey, profile, getCommentsByUserId };
