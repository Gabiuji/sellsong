import { Router } from "express";
import {
  searchSpotify,
  getArtistAlbums,
  getAlbumTracks,
} from "../controllers/spotifyController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Rota de busca: GET http://localhost:3000/api/spotify/search?q=nome_da_musica
router.get("/search", authMiddleware, searchSpotify);
router.get("/artists/:id/albums", authMiddleware, getArtistAlbums);
router.get("/albums/:id/tracks", authMiddleware, getAlbumTracks);

export default router;
