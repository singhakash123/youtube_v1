import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// cloudinary config :

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const removeUploadfile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const uploadOnCloudinary = async function (filePath, foldername) {
  try {
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
    console.log("file upload failed", error.message);
    removeUploadfile(filePath);
    return null;
  }
};
