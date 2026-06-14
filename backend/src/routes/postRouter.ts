import { Router } from "express";
import {
  createPost,
  getFeed,
  getPopularItems,
} from "../controllers/postController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getFeed);

// 🌟 ADICIONE ESTA LINHA: Define a rota de populares
router.get("/popular", authMiddleware, getPopularItems);

export default router;
