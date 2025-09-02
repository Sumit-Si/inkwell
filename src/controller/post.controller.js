import { db } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { handleFileUpload } from "../utils/fileUpload.js";
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

  let uploadResult;
  const filePath = req.file?.path;
  try {
    if (filePath) uploadResult = await handleFileUpload(filePath, "post");

    const post = await db.post.create({
      data: {
        title,
        description,
        bannerImage: uploadResult ? uploadResult?.url : null,
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
  } catch (error) {
    if (uploadResult) {
          handleFileDeletion(uploadResult?.publicId);
          cleanupTempFile(filePath);
        }
        throw new ApiError(500, error?.message || "Problem while creating post");
  }
});

const getPosts = asyncHandler(async (req, res) => {
  let { limit = 10, page = 1 } = req.query;

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const posts = await db.post.findMany({
    where: {
      status: "APPROVED",
    },
    take: parseInt(limit),
    skip: parseInt(skip),
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

  if (!posts || posts?.length === 0) {
    throw new ApiError(400, "Posts not exist");
  }
  const totalPosts = await db.post.count({
    where: {
      status: "APPROVED",
    },
  });
  const totalPages = Math.ceil(totalPosts / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        metadata: { totalPages, currentPage: page, currentLimit: limit },
      },
      "Posts fetched successfully",
    ),
  );
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

// comments controller
const createComment = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { postId } = req.params;
  const userId = req.user?.id;

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not exists");
  }

  const comment = await db.comment.create({
    data: {
      message,
      postId: post?.id,
      createdBy: userId,
    },
  });

  const createdComment = await db.comment.findUnique({
    where: {
      id: comment?.id,
    },
    select: {
      message: true,
      postId: true,
      createdBy: true,
      post: {
        select: {
          title: true,
          postedAt: true,
          id: true,
        },
      },
      user: {
        select: {
          fullName: true,
        },
      },
    },
  });

  if (!createdComment) {
    throw new ApiError(500, "Problem while creating comment");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdComment, "Comment created successfully"));
});

const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  let { limit = 10, page = 1 } = req.query;

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not exists");
  }
  const comments = await db.comment.findMany({
    where: {
      postId,
    },
    take: parseInt(limit),
    skip: parseInt(skip),
    select: {
      postId: true,
      message: true,
      createdBy: true,
      likeCount: true,
      post: {
        select: {
          title: true,
          postedAt: true,
        },
      },
    },
  });

  const totalComments = await db.comment.count();
  const totalPages = Math.ceil(totalComments / limit);

  if (!comments || comments?.length === 0) {
    throw new ApiError(404, "Comments not exist");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        metadata: { totalPages, currentPage: page, currentLimit: limit },
      },
      "Comments fetched successfully",
    ),
  );
});

const getCommentById = asyncHandler(async (req, res) => {
  const { postId, id } = req.params;
  console.log(req.query, "req query");

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not exists");
  }
  const comment = await db.comment.findFirst({
    where: {
      postId,
      id,
    },
    select: {
      postId: true,
      message: true,
      createdBy: true,
      likeCount: true,
      post: {
        select: {
          title: true,
          postedAt: true,
        },
      },
    },
  });

  if (!comment) {
    throw new ApiError(404, "Comment not exist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment fetched successfully"));
});

const updateCommentById = asyncHandler(async (req, res) => {
  const { postId, id } = req.params;
  const { message } = req.body;

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not exists");
  }

  const existingComment = await db.comment.findUnique({
    where: {
      id,
    },
  });

  if (!existingComment) {
    throw new ApiError(404, "Comment not exists");
  }

  const editedAt = new Date();

  const comment = await db.comment.update({
    where: {
      id: existingComment?.id,
    },
    data: {
      message,
      editedAt,
    },
  });

  if (!comment) {
    throw new ApiError(500, "Problem while updating comment");
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteCommentById = asyncHandler(async (req, res) => {
  const { postId, id } = req.params;

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not exists");
  }

  const existingComment = await db.comment.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!existingComment) {
    throw new ApiError(404, "Comment not exists");
  }

  const comment = await db.comment.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  if (!comment) {
    throw new ApiError(500, "Problem while deleting comment");
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

export {
  createPost,
  getPosts,
  getPublishedPostById,
  updatePostById,
  deletePostById,
  createComment,
  getComments,
  getCommentById,
  updateCommentById,
  deleteCommentById,
};
