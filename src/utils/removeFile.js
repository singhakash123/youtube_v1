import fs from "fs/promises";

export const removeFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("File deletion failed:", error.message);
  }
};
