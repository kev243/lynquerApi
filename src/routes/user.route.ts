import { authUser } from "../middlewares/auth";
import { login, register, validateToken } from "../controllers/user";
import express from "express";

const router = express.Router();

router.post("/register", register);
// router.post("/validate", validateCode);
router.post("/login", login);
router.post("/validateToken", validateToken);

export default router;
