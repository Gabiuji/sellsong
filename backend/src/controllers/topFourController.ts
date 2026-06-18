import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

// ==========================================
// SALVAR OU ATUALIZAR UM SLOT DO TOP 4
// ==========================================
export const setTopFourSlot = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = Number(req.user?.userId);
    const { position, spotifyTrackId, trackName, artistName, albumCover } =
      req.body;

    if (!currentUserId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Valida se a posição enviada está no range correto (1 a 4)
    if (!position || position < 1 || position > 4) {
      res
        .status(400)
        .json({ error: "Posição inválida. Escolha um slot de 1 a 4." });
      return;
    }

    // ele atualiza (update), se não existir, ele cria um novo (create).
    const topFourItem = await prisma.topFour.upsert({
      where: {
        userId_position: {
          userId: currentUserId,
          position: Number(position),
        },
      },
      update: {
        spotifyTrackId,
        trackName,
        artistName,
        albumCover,
      },
      create: {
        userId: currentUserId,
        position: Number(position),
        spotifyTrackId,
        trackName,
        artistName,
        albumCover,
      },
    });

    res.status(200).json(topFourItem);
  } catch (error) {
    console.error("Erro ao salvar Top 4:", error);
    res.status(500).json({ error: "Erro interno ao atualizar os favoritos." });
  }
};

// ==========================================
// BUSCAR O TOP 4 DE UM USUÁRIO ESPECÍFICO
// ==========================================
export const getUserTopFour = async (
  req: Request | any, // Aceita requisições autenticadas ou públicas
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;

    const items = await prisma.topFour.findMany({
      where: { userId: Number(userId) },
      orderBy: { position: "asc" }, // Garante que venha na ordem correta (1, 2, 3, 4)
    });

    res.json(items);
  } catch (error) {
    console.error("Erro ao buscar Top 4:", error);
    res.status(500).json({ error: "Erro interno ao carregar os favoritos." });
  }
};
