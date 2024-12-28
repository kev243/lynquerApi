import { register, validateCode } from "../controllers/user";
import express from "express";

const router = express.Router();

router.post("/register", register);
router.post("/validate", validateCode);

export default router;
