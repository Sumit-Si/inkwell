import { db } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getPendingPosts = asyncHandler(async (req, res) => {
  let { limit = 10, page = 1 } = req.query;

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const posts = await db.post.findMany({
    where: {
      status: "PENDING",
    },
    skip: parseInt(skip),
    take: parseInt(limit),
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
        },
      },
      postReview: {
        select: {
          comment: true,
          rating: true,
          status: true,
          reviewer: true,
        },
      },
    },
  });

  if (!posts || posts?.length === 0) {
    throw new ApiError("404", "Pending Posts not exist");
  }

  const totalPosts = await db.post.count({
    where: {
      status: "PENDING",
    },
  });
  const totalPages = Math.ceil(totalPosts / limit);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          posts,
          metadata: { totalPages, currentPage: page, currentLimit: limit },
        },
        "Pending Posts fetched successfully",
      ),
    );
});

const approvePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?.id;

  const post = await db.post.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not exists");
  }

  const updatePost = await db.post.update({
    where: {
      id,
    },
    data: {
      status: "APPROVED",
    },
  });

  let postRev;

  try {
    postRev = await db.postReview.upsert({
      where: {
        reviewer_postId: {
          reviewer: userId,
          postId: updatePost.id,
        },
      },
      update: {
        comment,
        rating: Number(rating),
      },
      create: {
        postId: updatePost?.id,
        comment,
        rating: Number(rating),
        status: "APPROVED",
        reviewer: userId,
      },
    });
  } catch (error) {
    throw new ApiError(500, error?.message || "Problem while approving a post");
  }

  const createdPostReview = await db.postReview.findUnique({
    where: {
      id: postRev?.id,
    },
    include: {
      author: {
        select: {
          username: true,
          fullName: true,
        },
      },
      postData: {
        select: {
          title: true,
          status: true,
        },
      },
    },
  });

  if (!createdPostReview) {
    throw new ApiError(500, "Problem while approving a post");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdPostReview, "Post approved by admin"));
});

const rejectPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let rating = req.body?.rating || 0;
  let comment = req.body?.comment || "";
  const userId = req.user?.id;

  const post = await db.post.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not exists");
  }

  const updatePost = await db.post.update({
    where: {
      id,
    },
    data: {
      status: "REJECTED",
    },
  });

  let postRev;

  try {
    postRev = await db.postReview.upsert({
      where: {
        reviewer_postId: {
          reviewer: userId,
          postId: updatePost.id,
        },
      },
      update: {
        comment,
        rating: Number(rating),
      },
      create: {
        postId: updatePost?.id,
        comment,
        rating: Number(rating),
        status: "REJECTED",
        reviewer: userId,
      },
    });
  } catch (error) {
    throw new ApiError(500, error?.message || "Problem while rejecting a post");
  }

  const createdPostReview = await db.postReview.findUnique({
    where: {
      id: postRev?.id,
    },
    include: {
      author: {
        select: {
          username: true,
          fullName: true,
        },
      },
      postData: {
        select: {
          title: true,
          status: true,
        },
      },
    },
  });

  if (!createdPostReview) {
    throw new ApiError(500, "Problem while rejecting a post");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdPostReview, "Post rejected by admin"));
});

export { getPendingPosts, approvePost, rejectPost };
