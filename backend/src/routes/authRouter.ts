import { Router } from "express";
import { register, login } from "../controllers/authController.js";

const router = Router();

// Rota de Cadastro: POST http://localhost:3001/api/auth/register
router.post("/register", register);

// Rota de Login: POST http://localhost:3001/api/auth/login
router.post("/login", login);

export default router;
