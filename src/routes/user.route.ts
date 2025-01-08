import { authUser } from "../middlewares/auth";
import {
  forgotPassword,
  getUser,
  login,
  register,
  resetPassword,
  updateUser,
  validateToken,
} from "../controllers/user";
import express from "express";
import { get } from "http";

const router = express.Router();

router.post("/register", register);
// router.post("/validate", validateCode);
router.post("/login", login);
router.post("/validateToken", validateToken);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword); // Reset password
router.get("/profile", authUser, getUser); // Get user profile
router.patch("/profile", authUser, updateUser); // Update user profile

export default router;
