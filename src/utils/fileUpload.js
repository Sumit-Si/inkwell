import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "./cloudinary.js";
import fs from "fs";
import path from "path";
import { ApiError } from "./ApiError.js";

/**
 * Handle file upload to Cloudinary
 * @param {string} localFilePath - Path to local file
 * @param {string} uploadType - Type of upload (post, userProfile)
 * @returns {Object} Cloudinary response with URL and public ID
 */
export const handleFileUpload = async (
  localFilePath,
  uploadType = "general",
) => {
  try {
    if (!localFilePath) {
      throw new ApiError(400, "No file path provided");
    }
    if (!fs.existsSync(localFilePath)) {
      throw new ApiError(404, "File not found");
    }

    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

    if (!cloudinaryResponse) {
      throw new ApiError(500, "Failed to upload file to Cloudinary");
    }

    return {
      success: true,
      url: cloudinaryResponse.secure_url,
      publicId: cloudinaryResponse.public_id,
      format: cloudinaryResponse.format,
      size: cloudinaryResponse.bytes,
      uploadType,
    };
  } catch (error) {
    console.error(`File upload error (${uploadType}):`, error);
    throw new ApiError(500, `Failed to upload ${uploadType} file: ${error.message}`);
  }
};


/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} Deletion response
 */
export const handleFileDeletion = async (publicId) => {
  try {
    if (!publicId) {
      throw new ApiError(400, "No public ID provided");
    }
    const deletionResponse = await deleteFromCloudinary(publicId);
    return {
      success: true,
      message: "File deleted successfully",
      result: deletionResponse,
    };
  } catch (error) {
    console.error("File deletion error:", error);
    throw new ApiError(500, `Failed to delete file: ${error.message}`);
  }
};


/**
 * Clean up temporary files
 * @param {string} filePath - Path to file to delete
 */
export const cleanupTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temporary file cleaned up:", filePath);
    }
  } catch (error) {
    console.error("Error cleaning up temp file:", error);
    throw new ApiError(500, "Error cleaning up temp file", error.message);
  }
};
