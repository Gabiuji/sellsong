import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

// BUSCAR PERFIL COMPLETO
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Busca os dados do usuário e conta os posts normalmente
    const user = await (prisma.user.findUnique({
      where: { id: Number(userId) },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    }) as any);

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    // Conta diretamente na tabela Follow usando filtros claros

    // Quem me segue: registros onde o followingId é o meu ID
    const followersCount = await prisma.follow.count({
      where: { followingId: Number(userId) },
    });

    // Quem eu sigo: registros onde o followerId é o meu ID
    const followingCount = await prisma.follow.count({
      where: { followerId: Number(userId) },
    });

    // 3. Devolve os dados com os contadores perfeitamente calibrados
    res.json({
      id: user.id,
      username: user.username,
      reviewCount: user._count.posts,
      followersCount: followersCount,
      followingCount: followingCount,
      bio: user.user_metadata?.bio || user.bio || "",
      avatarUrl: user.avatarUrl || "",
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro interno ao carregar perfil." });
  }
};

// ATUALIZAR PERFIL (BIO E AVATAR)
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { bio, avatarUrl } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        bio: bio !== undefined ? bio : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
      },
    });

    res.json({
      message: "Perfil atualizado com sucesso!",
      user: {
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro interno ao atualizar perfil." });
  }
};

// ==========================================
// BUSCAR USUÁRIOS NO SISTEMA
// ==========================================
export const searchUsers = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?.userId;

    if (!q) {
      res.status(400).json({ error: "Digite um termo para buscar." });
      return;
    }

    // Busca usuários cujo nome contenha o termo pesquisado, excluindo o próprio usuário logado
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: String(q),
          mode: "insensitive", // Ignora maiúsculas/minúsculas
        },
        id: {
          not: Number(currentUserId),
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        // Traz as relações para sabermos de antemão se já seguimos ou se somos seguidos
        followers: {
          where: { followerId: Number(currentUserId) },
        },
        following: {
          where: { followingId: Number(currentUserId) },
        },
      },
    });

    // Mapeia os resultados injetando flags facilitadoras para o frontend
    const formattedUsers = users.map((u: any) => {
      const amIFollowing = u.followers.length > 0;
      const isFollowingMe = u.following.length > 0;
      return {
        id: u.id,
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        isFollowing: amIFollowing,
        isFriend: amIFollowing && isFollowingMe, // Amizade se ambos se seguem!
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro interno ao buscar usuários." });
  }
};

// ==========================================
// SEGUIR / DEIXAR DE SEGUIR UM USUÁRIO (TOGGLE)
// ==========================================
export const toggleFollowUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = Number(req.user?.userId);
    const targetUserId = Number(req.params.id);

    if (currentUserId === targetUserId) {
      res.status(400).json({ error: "Você não pode seguir a si mesmo." });
      return;
    }

    // Verifica se a relação de "seguir" já existe no banco
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // Se já existe, deixa de seguir (Unfollow)
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      });
      res.json({
        message: "Deixou de seguir com sucesso!",
        isFollowing: false,
      });
    } else {
      // Se não existe, cria o vínculo (Follow)
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
      res.json({ message: "Seguindo com sucesso!", isFollowing: true });
    }
  } catch (error) {
    console.error("Erro ao processar follow:", error);
    res.status(500).json({ error: "Erro interno ao processar solicitação." });
  }
};

// ==========================================
// LISTAR CONEXÕES (SEGUIDORES E SEGUINDO)
// ==========================================
export const getUserConnections = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    const userIdNum = Number(currentUserId);

    // Puxar quem eu sigo (Following)
    const followingList = await prisma.follow.findMany({
      where: { followerId: userIdNum },
      include: {
        following: {
          select: { id: true, username: true, avatarUrl: true, bio: true },
        },
      },
    });

    // Puxar quem me segue (Followers)
    const followersList = await prisma.follow.findMany({
      where: { followingId: userIdNum },
      include: {
        follower: {
          select: { id: true, username: true, avatarUrl: true, bio: true },
        },
      },
    });

    // Criamos mapeamentos de IDs para realizar o cruzamento de amizade (follow mútuo)
    const myFollowingIds = new Set(followingList.map((f) => f.followingId));
    const myFollowersIds = new Set(followersList.map((f) => f.followerId));

    // Formatar lista de quem eu sigo
    const following = followingList.map((f: any) => ({
      id: f.following.id,
      username: f.following.username,
      avatarUrl: f.following.avatarUrl,
      bio: f.following.bio,
      isFriend: myFollowersIds.has(f.following.id), // É amigo se ele também me segue de volta
    }));

    // Formatar lista de quem me segue
    const followers = followersList.map((f: any) => ({
      id: f.follower.id,
      username: f.follower.username,
      avatarUrl: f.follower.avatarUrl,
      bio: f.follower.bio,
      isFollowingBack: myFollowingIds.has(f.follower.id), // Flag se eu sigo de volta (Amigos)
    }));

    res.json({ followers, following });
  } catch (error) {
    console.error("Erro ao buscar conexões do usuário:", error);
    res.status(500).json({ error: "Erro interno ao carregar conexões." });
  }
};
