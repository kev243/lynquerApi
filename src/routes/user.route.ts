import { authUser } from "../middlewares/auth";
import {
  forgotPassword,
  getUser,
  login,
  register,
  resetPassword,
  updateUser,
  uploadProfileImage,
  uploadProfileImageCloudinary,
  validateToken,
} from "../controllers/user";
import express from "express";
import { get } from "http";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/register", register);
// router.post("/validate", validateCode);
router.post("/login", login);
router.post("/validateToken", validateToken);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword); // Reset password
router.get("/profile", authUser, getUser); // Get user profile
router.patch("/profile", authUser, updateUser); // Update user profile
// router.post(
//   "/profile/upload",
//   authUser,
//   upload.single("image"),
//   uploadProfileImage
// );
router.post(
  "/profile/upload",
  authUser,
  upload.single("image"),
  uploadProfileImageCloudinary
);

export default router;
