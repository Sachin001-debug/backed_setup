import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // get user from DB
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

     req.user = user;

    next();
  } catch (error) {
    console.log("Auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};