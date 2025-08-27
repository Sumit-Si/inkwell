import { db } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPost = asyncHandler(async (req, res) => {});

const getPosts = asyncHandler(async (req, res) => {
  const posts = await db.post.findMany({
    include: {
      author: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
  });

  if (!posts && posts?.length === 0) {
    throw new ApiError(400, "Posts not exist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, posts, "Posts fetched successfully"));
});

const getPublishedPostById = asyncHandler(async (req, res) => {});

const updatePostById = asyncHandler(async (req, res) => {});

const deletePostById = asyncHandler(async (req, res) => {});

export {
  createPost,
  getPosts,
  getPublishedPostById,
  updatePostById,
  deletePostById,
};
