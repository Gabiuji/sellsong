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
    const {
      spotifyTrackId,
      trackName,
      artistName,
      albumCover,
      rating,
      review,
    } = req.body;

    // O id do usuário vem direto do token decodificado pelo middleware
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Validações básicas obrigatórias
    if (!spotifyTrackId || !trackName || !artistName || !rating) {
      res
        .status(400)
        .json({ error: "Dados da música e a nota são obrigatórios." });
      return;
    }

    // Valida se a nota está entre 1 e 5 estrelas
    if (rating < 1 || rating > 5) {
      res
        .status(400)
        .json({ error: "A nota deve ser um valor inteiro entre 1 and 5." });
      return;
    }

    // Salva o post atrelando ao ID do usuário autenticado
    const newPost = await prisma.post.create({
      data: {
        spotifyTrackId,
        trackName,
        artistName,
        albumCover,
        rating: Math.floor(rating), // Garante que é um número inteiro
        review,
        userId,
      },
      include: {
        author: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Recomendação postada com sucesso!",
      post: newPost,
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
