import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { config } from "../../config/config.js";

const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "User is unauthorized");
    }

    const decoded_token = await jwt.verify(
      token,
      config.ACCESS_TOKEN_SECRET_KEY
    );

    const user = await User.findById(decoded_token._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "user is unsuthories");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export { verifyJwt };
