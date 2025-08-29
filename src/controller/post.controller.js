import { db } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getSlug } from "../utils/slug.js";

const createPost = asyncHandler(async (req, res) => {
  const { title, description, postedAt } = req.body;
  const userId = req.user?.id;

  const existingPost = await db.post.findFirst({
    where: {
      title,
      createdBy: userId,
    },
  });

  if (existingPost) {
    throw new ApiError(400, "Post already exists");
  }

  const { slug } = getSlug(title);
  console.log(slug, "slug");

  const post = await db.post.create({
    data: {
      title,
      description,
      slug,
      createdBy: userId,
      postedAt,
    },
  });

  const createdPost = await db.post.findUnique({
    where: {
      id: post?.id,
    },
    include: {
      author: {
        select: {
          username: true,
          fullName: true,
        },
      },
      comments: {
        select: {
          message: true,
          likeCount: true,
          createdBy: true,
        },
      },
    },
  });

  if (!createdPost) {
    throw new ApiError(500, "Problem while creating post");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdPost, "Post created successfully"));
});

const getPosts = asyncHandler(async (req, res) => {
  const posts = await db.post.findMany({
    include: {
      author: {
        select: {
          username: true,
          fullName: true,
        },
      },
      comments: {
        select: {
          message: true,
          likeCount: true,
          createdBy: true,
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

const getPublishedPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findFirst({
    where: {
      id,
      status: "PUBLISHED",
    },
  });

  if (!post) {
    throw new ApiError(404, "Published post not exists");
  }

  res
    .status(200)
    .json(new ApiResponse(200, post, "Public post fetched successfully"));
});

const updatePostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const post = await db.post.findFirst({
    where: {
      id,
      createdBy: userId,
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not exists");
  }

  if (post?.status === "APPROVED") {
    throw new ApiError(403, "Post is approved and cannot be updated");
  }

  const { title, description, postedAt } = req.body;
  const { slug } = getSlug(title);

  const updatePost = await db.post.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      postedAt,
      slug,
    },
  });

  if (!updatePost) {
    throw new ApiError(500, "Problem while updating post");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatePost, "Post updated successfully"));
});

const deletePostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const post = await db.post.findFirst({
    where: {
      id,
      createdBy: userId,
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not exists");
  }

  const deletePost = await db.post.delete({
    where: {
      id,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, deletePost, "Post deleted successfully"));
});

export {
  createPost,
  getPosts,
  getPublishedPostById,
  updatePostById,
  deletePostById,
};
