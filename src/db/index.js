import mongoose from "mongoose";
import { config } from "../../config/config.js";
import { db_name } from "../constant.js";
import pino from "pino";

const logger = pino();

export const dbConnect = async (retry = 5) => {
  while (retry) {
    try {
      const connectionInstance = await mongoose.connect(
        `${config.MONGODB_URI}/${db_name}`
      );

      logger.info(
        `Database connected || DB HOST : ${connectionInstance.connection.host}`
      );

      break;
    } catch (error) {
      retry--;

      logger.error(`Database connection failed : ${error.message}`);

      logger.info(`Retries left : ${retry}`);

      if (retry === 0) {
        logger.fatal("All database connection retries failed");

        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

process.on("SIGINT", async () => {
  await mongoose.connection.close();

  logger.info("Database disconnected successfully");

  process.exit(0);
});
