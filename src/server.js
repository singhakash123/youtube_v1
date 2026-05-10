import { dbConnect } from "./db/index.js";
import { app } from "./app.js";
import { config } from "../config/config.js";
import pino from "pino";

const logger = pino();

const port = config.PORT;

dbConnect()
  .then(() => {
    const server = app.listen(port, () => {
      logger.info(`Sever is Listening at port : ${port}`);
    });

    server.on("error", (error) => {
      logger.fatal(`server error : ${error.message}`);
      process.exit(1);
    });

    process.on("SIGINT", () => {
      logger.info("Shutting down server...");

      server.close(() => {
        logger.info("server is shutting down");
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    logger.fatal(`database connection failed : ${error.message}`);
    process.exit(1);
  });

// unhandled promise rejection
process.on("unhandledRejection", (error) => {
  logger.fatal(`Unhandled Rejection: ${error.message}`);

  process.exit(1);
});

// uncaught exception
process.on("uncaughtException", (error) => {
  logger.fatal(`Uncaught Exception: ${error.message}`);

  process.exit(1);
});
