import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

// ==========================================
// CRIAR UM NOVO POST (REVIEW DE MÚSICA)
// ==========================================
export const createPost = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    console.log("--> PAYLOAD RECEBIDO NO BACKEND:", req.body);
    const {
      spotifyTrackId,
      trackName,
      artistName,
      albumCover,
      rating,
      review, // Campo vindo do formulário frontend
    } = req.body;

    // O id do usuário vem direto do token decodificado pelo middleware
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Validações básicas obrigatórias (nota 0.5 é válida, por isso checamos se rating existe)
    if (!spotifyTrackId || !trackName || !artistName || rating === undefined) {
      res
        .status(400)
        .json({ error: "Dados da música e a nota são obrigatórios." });
      return;
    }

    // Valida se a nota estilo Letterboxd está entre 0.5 e 5
    if (rating < 0.5 || rating > 5) {
      res
        .status(400)
        .json({ error: "A nota deve ser um valor entre 0.5 e 5 estrelas." });
      return;
    }

    const existingReview = await prisma.post.findFirst({
      where: {
        userId,
        spotifyTrackId,
      },
    });

    if (existingReview) {
      res.status(400).json({
        error:
          "Você já avaliou esta música! Que tal escolher outra para a sua review de hoje?",
      });
      return;
    }

    // Salva o post atrelando ao ID do usuário autenticado
    const newPost = await prisma.post.create({
      data: {
        spotifyTrackId,
        trackName,
        artistName,
        albumCover,
        rating: Number(rating),
        review,
        userId,
      },
    });

    // Respondemos com sucesso injetando os dados do autor manualmente no JSON
    res.status(201).json({
      message: "Avaliação compartilhada com sucesso!",
      post: {
        ...newPost,
        author: {
          username: req.user?.username,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao criar post:", error);
    res.status(500).json({ error: "Erro interno ao criar publicação." });
  }
};

// ==========================================
// LISTAR TIMELINE (POSTS DE QUEM EU SEGUO)
// ==========================================
export const getFeed = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = Number(req.user?.userId);

    if (!currentUserId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Busca os registros de quem o usuário logado está seguindo
    const follows = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });

    const followedIds = follows.map((f) => f.followingId);

    // Busca os posts dessas pessoas ordenados do mais recente para o mais antigo
    const posts = await prisma.post.findMany({
      where: {
        userId: {
          in: followedIds,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(posts);
  } catch (error) {
    console.error("Erro ao carregar feed:", error);
    res.status(500).json({ error: "Erro interno ao carregar feed." });
  }
};

// ==========================================
// LISTAR ITENS POPULARES (RANKING DE MÚSICAS MAIS BEM AVALIADAS)
// ==========================================
export const getPopularItems = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    // Agrupa os posts por música calculando a média e a contagem
    const groupData = await prisma.post.groupBy({
      by: ["spotifyTrackId"],
      _avg: {
        rating: true,
      },
      _count: {
        id: true, // Conta quantas pessoas avaliaram
      },
      orderBy: {
        _avg: {
          rating: "desc", // Maior média de nota no topo
        },
      },
      take: 10, //Limite de 10 músicas no ranking conforme pedido!
    });

    if (groupData.length === 0) {
      res.json([]);
      return;
    }

    // Coleta os metadados visuais (nome, artista, capa) dessas 10 músicas
    const trackIds = groupData.map((g) => g.spotifyTrackId);

    const uniqueTracks = await prisma.post.findMany({
      where: {
        spotifyTrackId: { in: trackIds },
      },
      select: {
        spotifyTrackId: true,
        trackName: true,
        artistName: true,
        albumCover: true,
      },
      distinct: ["spotifyTrackId"], // Garante que cada música só venha uma vez aqui
    });

    // Junta os dados do grupo com os dados visuais das faixas
    const ranking = groupData.map((group) => {
      const visualInfo = uniqueTracks.find(
        (t) => t.spotifyTrackId === group.spotifyTrackId,
      );

      return {
        spotifyTrackId: group.spotifyTrackId,
        trackName: visualInfo?.trackName || "Música Desconhecida",
        artistName: visualInfo?.artistName || "Artista Desconhecido",
        albumCover: visualInfo?.albumCover || "",
        averageRating: Number(group._avg.rating?.toFixed(2) || 0), // Média com 2 casas decimais
        reviewCount: group._count.id, // Guarda quantas pessoas votaram (legal para desempatar no futuro)
      };
    });

    res.json(ranking);
  } catch (error) {
    console.error("Erro ao calcular ranking popular:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao carregar itens populares." });
  }
};

// ==========================================
// LISTAR MEUS PRÓPRIOS POSTS (DIÁRIO)
// ==========================================
export const getMyDiary = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    const myPosts = await prisma.post.findMany({
      where: {
        userId: Number(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(myPosts);
  } catch (error) {
    console.error("Erro ao carregar diário:", error);
    res.status(500).json({ error: "Erro interno ao carregar o diário." });
  }
};

// ==========================================
// EDITAR UMA REVIEW EXISTENTE
// ==========================================
export const updatePost = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const postId = Number(req.params.id);
    const { rating, review } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Busca o post para garantir que ele existe e pertence ao usuário logado
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      res.status(404).json({ error: "Publicação não encontrada." });
      return;
    }

    if (existingPost.userId !== Number(userId)) {
      res
        .status(403)
        .json({ error: "Você não tem permissão para editar este post." });
      return;
    }

    // Valida a nota se ela foi enviada
    if (rating !== undefined && (rating < 0.5 || rating > 5)) {
      res
        .status(400)
        .json({ error: "A nota deve ser entre 0.5 e 5 estrelas." });
      return;
    }

    // Atualiza os dados no banco
    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        rating: rating !== undefined ? Number(rating) : undefined,
        review: review !== undefined ? review : undefined,
      },
    });

    res.json({ message: "Review atualizada com sucesso!", post: updated });
  } catch (error) {
    console.error("Erro ao atualizar post:", error);
    res.status(500).json({ error: "Erro interno ao atualizar post." });
  }
};

// ==========================================
// MÚSICAS MAIS RECOMENDADAS (ÚLTIMOS 7 DIAS)
// ==========================================
export const getWeeklyRecommendations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Calcula a data limite (exatamente 7 dias atrás)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Agrupa as avaliações no banco de dados
    const topTracks = await prisma.post.groupBy({
      by: ["spotifyTrackId", "trackName", "artistName", "albumCover"],
      where: {
        createdAt: {
          gte: sevenDaysAgo, // Filtra apenas posts dos últimos 7 dias
        },
      },
      _count: {
        spotifyTrackId: true, // Conta a quantidade de reviews/votos
      },
      _avg: {
        rating: true, // Calcula a nota média que a comunidade deu
      },
      orderBy: {
        _count: {
          spotifyTrackId: "desc", // Mais votadas primeiro
        },
      },
      take: 10, // Limita estritamente às 10 músicas mais recomendadas
    });

    // Formata o retorno para o frontend digerir de forma limpa
    const formattedRecommendations = topTracks.map((track) => ({
      spotifyTrackId: track.spotifyTrackId,
      trackName: track.trackName,
      artistName: track.artistName,
      albumCover: track.albumCover,
      votesCount: track._count.spotifyTrackId,
      averageRating: track._avg.rating || 0,
    }));

    res.json(formattedRecommendations);
  } catch (error) {
    console.error("Erro ao gerar recomendações semanais:", error);
    res.status(500).json({ error: "Erro interno ao processar recomendações." });
  }
};
