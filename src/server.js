import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import { app } from "./app.js";
import { db_connect } from "./db/index.js";


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
console.log("API KEY:", process.env.CLOUDINARY_API_KEY);
