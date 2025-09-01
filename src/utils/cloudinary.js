import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotnev from "dotenv";

dotnev.config();

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  // Assume file exists and path is valid
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "inkwell",
    });

    console.log("File uploaded on cloudinary:", response.url);
    // Cleanup local file after upload
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Cloudinary upload error:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};


const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from cloudinary:", response.result);
    return response;
  } catch (error) {
    console.log("Cloudinary delete error:", error);
    throw error;
  }
};



export { uploadOnCloudinary, deleteFromCloudinary };
