import express from "express";
import helmet from "helmet";
import cors from "cors";
import { config } from "../config/config.js";
import { limit } from "./constant.js";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

// security :

app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

// body parsing :
app.use(
  express.json({
    limit,
  })
);

app.use(
  express.urlencoded({
    limit,
    extended: true,
  })
);

// static file handling :
app.use("/public", express.static("public"));
// rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many requests, please try again later",
});

app.use("/api", limiter);

//cookie-parser :
app.use(cookieParser());

//  morgan : this is for the future to track the error of the code to understand the value :
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.set("trust proxy", 1);

export { app };
