import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryuploader } from "../services/cloudinary.js";
import mongoose, { Types } from "mongoose";

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "curret user fetched successFully"));
});

// update user profile :

const updateUserProfile = asyncHandler(async (req, res) => {
  // first i will take fullname and email from the frontend
  // then i will detail of user by req.user and i will update it
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const existingUser = await User.findOne({
    email,
    _id: { $ne: req.user._id },
  });

  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: fullName.trim(),
        email: email.trim(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "username and email updated successFully"
      )
    );
});

// update password :
const updatePassword = asyncHandler(async (req, res) => {
  // take new password and old password
  // check old password and new password not there throw errro
  // then check old and new password should not be same : and i want to check all the password which user used that should not be same
  // if same throw error
  // then update this password
  // save it into the databse
  // return response to the client the saved password
  const { newPassword, oldPassword } = req.body;

  if (!newPassword || !oldPassword) {
    throw new ApiError(400, "newpassword and oldpassword is required");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "oldpassword and newPassword is same");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(400, "unauthrozed user");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "old password is incorrect");
  }
  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  // get avatar from multer
  const avatarLocalPath = req.file?.path;

  // validation
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload on cloudinary
  const uploadedAvatar = await cloudinaryuploader(avatarLocalPath, "avatars");

  // check upload success
  if (!uploadedAvatar) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  // update user avatar
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: uploadedAvatar.url,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -refreshToken");

  // send response
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocal = req.file?.path;
  if (!coverImageLocal) {
    throw new ApiError(400, "coverImage file is required");
  }
  const uploadCoverImage = await cloudinaryuploader(
    coverImageLocal,
    "coverImage"
  );

  if (!uploadCoverImage) {
    throw new ApiError(400, "Error while uploading cover image");
  }
  const updatedCoverImage = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: uploadCoverImage.url,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCoverImage, "cover image upload successFully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName?.trim()) {
    throw new ApiError(409, "username is missing");
  }

  const user = await User.aggregate([
    {
      $match: {
        userName: userName.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriber",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        totalSubscriber: {
          $size: "$subscriber",
        },
        subscribedTo: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $in: [
            new mongoose.Types.ObjectId(req.user._id),
            "$subscriber.subscriber",
          ],
        },
      },
    },
    {
      $project: {
        userName: 1,
        email: 1,
        fullName: 1,
        isSubscribed: 1,
        subscribedTo: 1,
        totalSubscriber: 1,
      },
    },
  ]);
});

const watchHistory = asyncHandler(async (req, res) => {
  const user = User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localfiled: "owner",
              foreignField: "_id",
              as: "watchHistory",
              pipline: [
                {
                  $addFields: {
                    owner: "$owner",
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully"
      )
    );
});
export {
  getCurrentUser,
  updateUserProfile,
  updatePassword,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  watchHistory,
};
