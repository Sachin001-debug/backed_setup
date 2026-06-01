import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

//all import details 
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Db Connected!!");
  } catch (error) {
    console.error("DB connection error:", error);
  }
};
export default dbConnection;