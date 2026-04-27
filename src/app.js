import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { limit } from "./constant.js";
import { userRouter } from "./routes/user.routes.js";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit,
  })
);

app.use(express.static("public"));

app.use(cookieParser());

app.use("/api/v1/user", userRouter);
export { app };
