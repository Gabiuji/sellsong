import { Router } from "express";
import {
  setTopFourSlot,
  getUserTopFour,
} from "../controllers/topFourController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.put("/", authMiddleware, setTopFourSlot);
router.get("/:userId", getUserTopFour); // Rota pública para qualquer um ver o perfil de outro

export default router;
