import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const authRouter = Router();

const uploadMiddleware = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);
authRouter.route("/register").post(uploadMiddleware, registerUser);
authRouter.route("/login").post(loginUser);
authRouter.route("/logout").post(verifyJwt, logoutUser);

export { authRouter };
