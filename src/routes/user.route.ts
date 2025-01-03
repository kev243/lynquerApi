import { authUser } from "../middlewares/auth";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  validateToken,
} from "../controllers/user";
import express from "express";

const router = express.Router();

router.post("/register", register);
// router.post("/validate", validateCode);
router.post("/login", login);
router.post("/validateToken", validateToken);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);

export default router;
