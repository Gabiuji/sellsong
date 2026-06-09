import { Request, Response } from "express";
import { searchTracks } from "../services/spotifyService.js";

export const search = async (req: Request, res: Response): Promise<void> => {
  try {
    // Pega o termo de busca dos query params (ex: /search?q=nome_da_musica)
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      res
        .status(400)
        .json({ error: 'O parâmetro de busca "q" é obrigatório.' });
      return;
    }

    // Chama o serviço que conecta com a API do Spotify
    const tracks = await searchTracks(q);

    res.json(tracks);
  } catch (error) {
    console.error("Erro na busca do Spotify:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao buscar músicas no Spotify." });
  }
};
