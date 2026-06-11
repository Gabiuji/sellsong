import { Router } from "express";
import { toggleFollow, getNetwork } from "../controllers/followController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Rota para seguir/unfollow: Precisa estar logado
router.post("/:followingId", authMiddleware, toggleFollow);

// Rota para ver a lista de seguidores/seguidos: Pública
router.get("/:userId/network", getNetwork);

export default router;
