import express from 'express';
import { changePassword, getMe, loginUser, registerUser } from '../controller/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';


const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/me', authMiddleware, getMe);
userRouter.post("/change-password", authMiddleware, changePassword);


export default userRouter;
