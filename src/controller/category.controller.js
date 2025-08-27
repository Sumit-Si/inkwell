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
  const categories = await db.category.findMany();

  if (!categories && categories.length === 0) {
    throw new ApiError(400, "Categories not exist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

export { addCategory, getCategories };
