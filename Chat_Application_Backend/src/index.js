require("dotenv").config({ path: "./.env" });
const express = require("express");
const app = express();
const connectDB = require("./Database/connection");
const authRouter = require("./Authentication/authRouter")
const cors = require("cors");
const cookieParser = require("cookie-parser");

var corsOptions = { 
  origin: "http://localhost:5173",
  credentials: true,
};

connectDB()
  .then(() => {
    console.log("Database connection successfull");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port number ${process.env.PORT}`);
    });
  })
  .catch((err) =>
    console.log("Internal server error occured while connecting to Database")
  );

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
