import { Router } from "express";
import { createPost, getFeed } from "../controllers/postController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Rota para criar post: Protegida pelo middleware de autenticação
router.post("/", authMiddleware, createPost);

// Rota para ver o feed global: Pública (qualquer um pode ler o feed inicial)
router.get("/feed", getFeed);

export default router;
