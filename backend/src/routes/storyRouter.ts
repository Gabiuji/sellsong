import { Router } from "express";
import {
  createStory,
  deleteStory,
  getFriendsStories,
} from "../controllers/storyController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createStory);
router.get("/", authMiddleware, getFriendsStories);
router.delete("/:id", authMiddleware, deleteStory);

export default router;
