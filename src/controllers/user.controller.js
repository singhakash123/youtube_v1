import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  if (
    [userName, email, fullName, password].some(
      (item) => !item || item.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const exitUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (exitUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocal = req.files?.avatar?.[0]?.path;

  if (!avatarLocal) {
    throw new ApiError(400, "Avatar is required");
  }

  const coverImage = req.files?.coverImage?.[0]?.path;

  const avatarUrl = await uploadOnCloudinary(avatarLocal);

  if (!avatarUrl?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  let coverImageUrl;

  if (coverImage) {
    const uploaded = await uploadOnCloudinary(coverImage);
    coverImageUrl = uploaded?.url;
  }

  const user = await User.create({
    userName,
    email,
    fullName,
    password,
    avatar: avatarUrl.url,
    coverImage: coverImageUrl || undefined,
  });
});

export { registerUser };
