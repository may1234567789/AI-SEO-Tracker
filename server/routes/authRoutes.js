import express from "express";
import { login, register, getUser } from "../controllers/authController.js"
import auth from "../middleware/auth";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/register", login);
authRouter.get("/user", auth, getUser);

export default authRouter;