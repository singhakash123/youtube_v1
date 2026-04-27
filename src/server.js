import dotenv from "dotenv";
import { db_connect } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;
db_connect()
  .then((result) => {
    app.listen(port, () => {
      console.log(`Server is listening at : ${port}`);
    });
  })
  .catch((err) => {
    console.error(`Database connection failed : ${err.message}`);
  });
