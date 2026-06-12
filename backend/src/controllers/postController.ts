import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

const prisma = new PrismaClient();

// ==========================================
// 1. CRIAR UM NOVO POST (REVIEW DE MÚSICA)
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

    // 🌟 ALTERAÇÃO 1: Valida se a nota estilo Letterboxd está entre 0.5 e 5
    if (rating < 0.5 || rating > 5) {
      res
        .status(400)
        .json({ error: "A nota deve ser um valor entre 0.5 e 5 estrelas." });
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
// 2. LISTAR TODOS OS POSTS (FEED GLOBAL)
// ==========================================
export const getFeed = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    // Busca os posts do mais recente para o mais antigo
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json(posts);
  } catch (error) {
    console.error("Erro ao buscar feed:", error);
    res.status(500).json({ error: "Erro interno ao carregar o feed." });
  }
};
