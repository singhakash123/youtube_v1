import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

let isConfigured = false;

const ensureCloudinary = () => {
  if (!isConfigured) {
    console.log("CONFIG KEY:", process.env.CLOUDINARY_API_KEY); // debug

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    isConfigured = true;
  }
};

import path from "path";

const removeUploadfile = (filePath) => {
  const fullPath = path.resolve(filePath);

  if (filePath && fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log("✅ File deleted:", fullPath);
  } else {
    console.log("❌ File not found:", fullPath);
  }
};

export const uploadOnCloudinary = async function (
  filePath,
  foldername = "uploads"
) {
  try {
    ensureCloudinary(); // 👈 yahin config hoga (correct time pe)

    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: foldername,
    });

    removeUploadfile(filePath);

    return {
      url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    console.log("❌ Cloudinary Error:", error.message);
    removeUploadfile(filePath);
    return null;
  }
};
