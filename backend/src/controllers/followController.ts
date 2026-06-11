import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

// ==========================================
// 1. SEGUIR / DEIXAR DE SEGUIR UM USUÁRIO
// ==========================================
export const toggleFollow = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const followerId = req.user?.userId; // O usuário logado (quem vai seguir)
    const { followingId } = req.params; // O ID de quem será seguido (vem da URL)

    const targetUserId = parseInt(followingId);

    if (!followerId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    if (isNaN(targetUserId)) {
      res.status(400).json({ error: "ID de usuário inválido." });
      return;
    }

    // Regra de negócio: Um usuário não pode seguir a si mesmo
    if (followerId === targetUserId) {
      res.status(400).json({ error: "Você não pode seguir a si mesmo." });
      return;
    }

    // Verifica se o usuário alvo realmente existe no sistema
    const targetUserExists = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUserExists) {
      res.status(404).json({ error: "Usuário não encontrado para seguir." });
      return;
    }

    // Verifica se a relação de follow já existe no banco
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Se já existe, significa "Deixar de seguir" (Unfollow)
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      res.json({
        message: `Você deixou de seguir @${targetUserExists.username}.`,
      });
      return;
    }

    // Se não existe, cria o novo vínculo de Follow
    await prisma.follow.create({
      data: {
        followerId: followerId,
        followingId: targetUserId,
      },
    });

    res.status(201).json({
      message: `Agora você está seguindo @${targetUserExists.username}!`,
    });
  } catch (error) {
    console.error("Erro no toggleFollow:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao processar solicitação de amizade." });
  }
};

// ==========================================
// 2. LISTAR SEGUIDORES E SEGUIDOS DE UM PERFIL
// ==========================================
export const getNetwork = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const targetUserId = parseInt(userId);

    if (isNaN(targetUserId)) {
      res.status(400).json({ error: "ID de usuário inválido." });
      return;
    }

    // Busca o usuário trazendo a lista de quem ele segue e quem o segue
    const userNetwork = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        username: true,
        following: {
          select: {
            following: {
              select: { id: true, username: true },
            },
          },
        },
        followers: {
          select: {
            follower: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });

    if (!userNetwork) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    // Formata o JSON para ficar limpo para o Frontend
    const formattedNetwork = {
      username: userNetwork.username,
      following: userNetwork.following.map((f) => f.following),
      followers: userNetwork.followers.map((f) => f.follower),
    };

    res.json(formattedNetwork);
  } catch (error) {
    console.error("Erro ao buscar rede de contatos:", error);
    res.status(500).json({ error: "Erro interno ao carregar conexões." });
  }
};
