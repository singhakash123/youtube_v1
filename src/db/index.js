import mongoose from "mongoose";
import { db_name } from "../constant.js";

export const db_connect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${db_name}`
    );

    console.log(
      `Database connected || DB HOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(`Database connection failed : ${error.message}`);
    process.exit(1);
  }
};
