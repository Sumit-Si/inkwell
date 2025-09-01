import { ApiError } from "../utils/ApiError.js";
import multer from "multer";

/**
 * Middleware to handle multer upload errors
 */
export const handleFileUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      throw new ApiError(400, "File too large. Please check size limits.");
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      throw new ApiError(
        400,
        "Too many files. Please upload one file at a time.",
      );
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      throw new ApiError(400, "Unexpected file field.");
    }
    throw new ApiError(400, "File upload error");
  }

  if (error.message === "Only image files are allowed!") {
    throw new ApiError(400, "Only image files (JPEG, PNG, WebP) are allowed");
  }

  next(error);
};

/**
 * Middleware to validate uploaded file
 */
export const validateUploadedFile = (req, res, next) => {
  // Check if file exists
  if (!req.file || !req.file?.path) {
    throw new ApiError(400, "File upload failed");
  }

  next();
};

/**
 * Middleware to handle multiple file uploads
 */
export const handleMultipleFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No files uploaded");
  }

  // Check if all files exist
  const invalidFiles = req.files.filter((file) => !file.path);
  if (invalidFiles.length > 0) {
    throw new ApiError(400, "Some files failed to upload");
  }

  next();
};
