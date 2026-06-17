import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

// ==========================================
// CRIAR / ATUALIZAR STORY DO DIA
// ==========================================
export const createStory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = Number(req.user?.userId);
    const {
      spotifyTrackId,
      trackName,
      artistName,
      albumCover,
      previewUrl,
      caption,
      genreTag,
      spotifyUrl,
    } = req.body;

    if (!currentUserId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    if (!caption || caption.length > 150) {
      res.status(400).json({
        error: "A descrição é obrigatória e deve ter no máximo 150 caracteres.",
      });
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Em vez de barrar o usuário, nós apagamos o story anterior do dia se ele existir
    await prisma.dailyStory.deleteMany({
      where: {
        userId: currentUserId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Cria o novo story (que passará a ser o único do dia)
    const story = await prisma.dailyStory.create({
      data: {
        userId: currentUserId,
        spotifyTrackId,
        trackName,
        artistName,
        albumCover,
        previewUrl,
        spotifyUrl,
        caption,
        genreTag,
      },
    });

    res.status(201).json(story);
  } catch (error) {
    console.error("Erro ao criar story:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao salvar recomendação diária." });
  }
};

// ==========================================
// EXCLUIR UM STORY ESPECÍFICO
// ==========================================
export const deleteStory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = Number(req.user?.userId);
    const { id } = req.params;

    if (!currentUserId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Busca o story para verificar o dono
    const story = await prisma.dailyStory.findUnique({
      where: { id: Number(id) },
    });

    if (!story) {
      res.status(404).json({ error: "Story não encontrado." });
      return;
    }

    if (story.userId !== currentUserId) {
      res
        .status(403)
        .json({ error: "Você não tem permissão para excluir este story." });
      return;
    }

    // Deleta o registro do banco
    await prisma.dailyStory.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Story excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar story:", error);
    res.status(500).json({ error: "Erro interno ao excluir story." });
  }
};

// ==========================================
// LISTAR STORIES APENAS DE AMIGOS MÚTUOS
// ==========================================
export const getFriendsStories = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = Number(req.user?.userId);

    if (!currentUserId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Busca quem o usuário logado ESTÁ SEGUINDO
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true }, // Removido o lixo de código 'Sample_followingId'
    });
    const followingIds = following.map((f) => f.followingId);

    // Filtra quem dessas pessoas TAMBÉM segue o usuário logado de volta (Amizade Mútua)
    const mutualFollows = await prisma.follow.findMany({
      where: {
        followerId: { in: followingIds },
        followingId: currentUserId,
      },
      select: { followerId: true },
    });
    const friendIds = mutualFollows.map((f) => f.followerId);

    // Inclui o próprio ID do usuário para que o story dele também apareça para ele mesmo na barra!
    friendIds.push(currentUserId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Busca as recomendações diárias criadas HOJE por esse grupo de amigos
    const stories = await prisma.dailyStory.findMany({
      where: {
        userId: { in: friendIds },
        createdAt: { gte: todayStart },
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    res.json(stories);
  } catch (error) {
    console.error("Erro ao buscar stories de amigos:", error);
    res.status(500).json({ error: "Erro interno ao carregar stories." });
  }
};
