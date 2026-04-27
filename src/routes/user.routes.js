import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser); // POST    /api/v1/user/register

export { userRouter };
