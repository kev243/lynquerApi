import {
  createLink,
  deleteLink,
  getLinks,
  getLinksByUsername,
  updateLink,
  updateLinkPositions,
  updateVisibility,
} from "../controllers/link";
import { authUser } from "../middlewares/auth";
import express from "express";

const router = express.Router();

router.post("/create", authUser, createLink);
router.get("/all", authUser, getLinks);
router.delete("/delete/:id", authUser, deleteLink);
router.put("/update/:id", authUser, updateLink);
router.patch("/visible/:id", authUser, updateVisibility);
router.put("/positions", updateLinkPositions);
router.get("/:username", getLinksByUsername);

export default router;
