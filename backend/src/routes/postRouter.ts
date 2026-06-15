import { Router } from "express";
import {
  createPost,
  getFeed,
  getMyDiary,
  getPopularItems,
  updatePost,
} from "../controllers/postController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getFeed);

router.get("/popular", authMiddleware, getPopularItems);
router.get("/diary", authMiddleware, getMyDiary);
router.put("/:id", authMiddleware, updatePost);

export default router;
