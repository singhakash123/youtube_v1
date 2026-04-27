import dotenv from "dotenv";
import { db_connect } from "./db/index.js";

dotenv.config({
  path: "./.env",
});

db_connect();
