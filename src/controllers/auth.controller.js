import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";
import { User } from "../models/user.model.js";
import { cloudinaryuploader } from "../services/cloudinary.js";
import { cookieOptions } from "../constant.js";
import jwt from "jsonwebtoken";
import { config } from "../../config/config.js";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(300, "User does not exist");
  }

  const accessToken = user.generateAccessToken();

  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  // get data from the frontend :
  // check data comes or not -if not then throw the error message
  // get user by email or username - if get then throw the error
  // get photo from the multer
  // upload on cloudinary
  // create user : means what you want to send
  // send response

  const { userName, email, password, fullName } = req.body;
  logger.info("username : ", userName);
  if (
    [userName, email, password, fullName].some(
      (item) => !item || item.trim() === ""
    )
  ) {
    throw new ApiError(400, "all field are required");
  }

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "user already exit");
  }

  const avatarLocal = req.files?.avatar?.[0].path;
  if (!avatarLocal) {
    throw new ApiError(400, "avatar is required ");
  }

  const coverImage = req.files?.coverImage?.[0].path;

  const avatarUrl = await cloudinaryuploader(avatarLocal);
  if (!avatarUrl) {
    throw new ApiError(400, "avatar is required ");
  }

  const coverImageUrl = coverImage ? await cloudinaryuploader(coverImage) : "";

  const user = await User.create({
    fullName,
    userName,
    email,
    avatar: avatarUrl.url,
    coverImage: coverImageUrl?.url,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password  -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get data from the frontend (email and username and password)
  // check all fieled are coming or not if not send the error
  // check does this user exit or not (by email and username)
  // if not exit then throw error
  // if exit then check password (is password is correct or not)
  // then generate access and refresh token
  // then send res and token
  const { userName, email, password } = req.body;
  if (!(userName || email) || !password) {
    throw new ApiError(300, "username/ email and password is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  }).select("+password");

  if (!user) {
    throw new ApiError(300, "user does not exits");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(300, "password is not correct");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id);
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  /* 
  get refresh token
↓
check exists
↓
verify token
↓
find user
↓
compare DB token
↓
generate new tokens
↓
save new refresh token
↓
send new cookie
*/
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized access");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      config.REFRESH_TOKEN_SECRET_KEY
    );

    const user = await User.findById(decodedToken._id).select("+refreshToken");
    if (!user) {
      throw new ApiError(401, "unauthorized access");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or invalid");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "access and refreshToken generated"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
