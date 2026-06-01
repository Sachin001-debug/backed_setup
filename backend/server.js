import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {sequelize} from "./config/db.js";
import startServer from "./config/db.js";
import dbConnection from "./config/db.js";

import './models/userModel.js'
import userRouter from "./router/userRouter.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Backend API is running ");
});

const PORT = process.env.PORT;

//db connection (mysql)
dbConnection();

await sequelize.sync({ alter: true });

//api here
app.use('/api/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});