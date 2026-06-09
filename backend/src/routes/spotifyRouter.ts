import { Router } from "express";
import { search } from "../controllers/spotifyController.js";

const router = Router();

// Rota de busca: GET http://localhost:3000/api/spotify/search?q=nome_da_musica
router.get("/search", search);

export default router;
