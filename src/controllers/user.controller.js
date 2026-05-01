import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError("User not found");
  }

  // 🔥 generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // 🔥 save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  // 1. Validation
  if (
    [userName, email, fullName, password].some((f) => !f || f.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Check existing user
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  // 3. Avatar check
  const avatarLocal = req.files?.avatar?.[0]?.path;
  if (!avatarLocal) {
    throw new ApiError(400, "Avatar is required");
  }

  const coverImageLocal = req.files?.coverImage?.[0]?.path;

  // 4. Upload
  const avatar = await uploadOnCloudinary(avatarLocal, "avatar");
  if (!avatar) {
    throw new ApiError(500, "Avatar upload failed");
  }

  let coverImage = "";
  if (coverImageLocal) {
    const uploadedCover = await uploadOnCloudinary(coverImageLocal, "cover");
    coverImage = uploadedCover?.url || "";
  }

  // 5. Create user
  const user = await User.create({
    fullName,
    userName,
    email,
    password,
    avatar: avatar.url,
    coverImage,
  });

  // 6. Safe user
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.refreshToken;

  // 7. Response
  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", safeUser));
});

export { registerUser };
