import { db } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addCategory = asyncHandler(async (req, res) => {
  const { categoryName, parentId } = req.body;
  const userId = req.user?.id;

  const existingCategory = await db.category.findUnique({
    where: {
      categoryName,
      createdBy: userId,
    },
  });

  if (existingCategory) {
    throw new ApiError(400, "Category already exists");
  }

  const category = await db.category.create({
    data: {
      categoryName,
      createdBy: userId,
      parentId,
    },
  });

  const createdCategory = await db.category.findUnique({
    where: {
      id: category?.id,
    },
    include: {
      posts: {
        select: {
          title: true,
          status: true,
          postedAt: true,
        },
      },
      user: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
  });

  if (!createdCategory) {
    throw new ApiError(500, "Problem while created category");
  }

  res
    .status(201)
    .json(
      new ApiResponse(201, createdCategory, "Category created successfully"),
    );
});

const getCategories = asyncHandler(async (req, res) => {
  let { limit = 10, page = 1 } = req.query;

  if (page <= 0) page = 1;
  if (limit <= 0 || limit >= 50) {
    limit = 10;
  }

  const skip = (page - 1) * limit;

  const categories = await db.category.findMany({
    take: parseInt(limit),
    skip: parseInt(skip),
  });

  if (!categories || categories?.length === 0) {
    throw new ApiError(400, "Categories not exist");
  }

  const totalCategories = await db.category.count();
  const totalPages = Math.ceil(totalCategories / limit);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          categories,
          metadata: { totalPages, currentPage: page, currentLimit: limit },
        },
        "Categories fetched successfully",
      ),
    );
});

export { addCategory, getCategories };
