import { v2 as cloudinary } from "cloudinary";
import { config } from "../../config/config.js";
import { removeFile } from "../utils/removeFile.js";

cloudinary.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.CLOUD_API_KEY,
  api_secret: config.CLOUD_API_SECRET,
});

export const cloudinaryuploader = async (fileRequest, folderName) => {
  try {
    if (!fileRequest) return null;
    const response = await cloudinary.uploader.upload(fileRequest, {
      folder: folderName,
      resource_type: "auto",
    });

    await removeFile(fileRequest);

    return {
      url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error) {
    console.error(`File upload failed :   ${error.message}`);
    await removeFile(fileRequest);
    return null;
  }
};
