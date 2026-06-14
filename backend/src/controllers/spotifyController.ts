import { Request, Response } from "express";
import axios from "axios";

// Helper para pegar o Token do Spotify (reutilize a lógica que você já tem implementada)
// Se você já tiver um serviço/middleware que injeta o token, pode pular essa declaração.
const getSpotifyClientToken = async (): Promise<string> => {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  return response.data.access_token;
};

// 1. BUSCA FILTRADA (Música, Álbum ou Artista)
export const searchSpotify = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { q, type } = req.query;
    const searchType = type === "album" || type === "artist" ? type : "track";

    if (!q) {
      res.status(400).json({ error: "O termo de busca é obrigatório." });
      return;
    }

    const token = await getSpotifyClientToken();

    // Deixamos apenas o termo e o tipo para isolar o problema
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: String(q),
        type: searchType,
        // 🌟 REMOVIDO O LIMIT DAQUI TEMPORARIAMENTE
      },
    });

    let data = [];

    // Formata a resposta com base no tipo real que o Spotify retornou
    if (searchType === "track" && response.data.tracks) {
      data = response.data.tracks.items.map((item: any) => ({
        id: item.id,
        type: "track",
        name: item.name,
        artist: item.artists.map((a: any) => a.name).join(", "),
        album: item.album.name,
        albumCover: item.album.images[0]?.url || "",
        durationMs: item.duration_ms,
        spotifyUrl: item.external_urls.spotify,
      }));
    } else if (searchType === "album" && response.data.albums) {
      data = response.data.albums.items.map((item: any) => ({
        id: item.id,
        type: "album",
        name: item.name,
        artist: item.artists.map((a: any) => a.name).join(", "),
        albumCover: item.images[0]?.url || "",
        releaseDate: item.release_date,
      }));
    } else if (searchType === "artist" && response.data.artists) {
      data = response.data.artists.items.map((item: any) => ({
        id: item.id,
        type: "artist",
        name: item.name,
        // 🌟 PROTEÇÃO: Verifica se existem gêneros listados antes de fatiar o array
        genres:
          item.genres && item.genres.length > 0
            ? item.genres.slice(0, 2).join(", ")
            : "Musical",
        // 🌟 PROTEÇÃO: Se o artista não tiver nenhuma imagem, injeta um placeholder em vez de quebrar o código
        avatar:
          item.images && item.images[0]
            ? item.images[0].url
            : "https://via.placeholder.com/150",
      }));
    }

    res.json(data);
  } catch (error: any) {
    if (error.response) {
      console.error(
        "--> ERRO DETALHADO DO SPOTIFY:",
        error.response.status,
        error.response.data,
      );
    } else {
      console.error("--> ERRO DE CONEXÃO:", error.message);
    }
    res.status(500).json({ error: "Erro ao consultar catálogo do Spotify." });
  }
};

// 2. BUSCAR ÁLBUNS DE UM ARTISTA
export const getArtistAlbums = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const token = await getSpotifyClientToken();

    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${id}/albums`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { include_groups: "album,single", limit: 12 },
      },
    );

    const albums = response.data.items.map((item: any) => ({
      id: item.id,
      type: "album",
      name: item.name,
      albumCover: item.images[0]?.url || "",
      releaseDate: item.release_date,
    }));

    res.json(albums);
  } catch (error) {
    console.error("Erro ao buscar álbuns do artista:", error);
    res.status(500).json({ error: "Erro ao buscar álbuns do artista." });
  }
};

// 3. BUSCAR MÚSICAS DE UM ÁLBUM (TRACKLIST)
export const getAlbumTracks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const token = await getSpotifyClientToken();

    // 1. Buscamos os dados do Álbum Pai primeiro para herdar a capa e o nome
    const albumInfo = await axios.get(
      `https://api.spotify.com/v1/albums/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    // 2. Buscamos as faixas de dentro dele
    const response = await axios.get(
      `https://api.spotify.com/v1/albums/${id}/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 30 },
      },
    );

    // O Spotify retorna a lista de faixas dentro de response.data.items diretamente
    const tracks = response.data.items.map((item: any) => ({
      id: item.id,
      type: "track",
      name: item.name,
      artists: item.artists.map((a: any) => a.name).join(", "),
      albumName: albumInfo.data.name,
      albumCover: albumInfo.data.images[0]?.url || "", // Injeta a capa do álbum pai!
    }));

    res.json(tracks);
  } catch (error) {
    console.error("Erro ao buscar faixas do álbum:", error);
    res
      .status(500)
      .json({ error: "Não foi possível listar as faixas deste álbum." });
  }
};
