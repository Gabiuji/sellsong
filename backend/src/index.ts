import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRouter.js";
import spotifyRoutes from "./routes/spotifyRouter.js";
import postRoutes from "./routes/postRouter.js";
import followRoutes from "./routes/followRouter.js";
import userRoutes from "./routes/userRouter.js";
import storyRoutes from "./routes/storyRouter.js";
import topFourRoutes from "./routes/topFourRouter.js";

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

// ==========================================
// VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
// ==========================================
if (!process.env.JWT_SECRET) {
  throw new Error("ERRO CRÍTICO: JWT_SECRET não está definida no arquivo .env");
}

// ==========================================
// SEGURANÇA - MIDDLEWARES GLOBAIS
// ==========================================

// Helmet: Define headers HTTP seguros
app.use(helmet());

// CORS com Whitelist
const allowedOrigins = [
  "http://localhost:5173", // Vite dev
  "http://localhost:3000", // Fallback
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Se não há origin (requests do servidor) ou está na whitelist, permite
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS não permitido"));
      }
    },
    credentials: true,
  }),
);

// Rate Limiting: Protege contra brute force
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // 100 requisições por IP
  message: "Muitas requisições deste IP, por favor tente novamente mais tarde.",
  standardHeaders: true, // Retorna info em `RateLimit-*` headers
  legacyHeaders: false, // Desativa os headers `X-RateLimit-*`
  skip: (req) => {
    // Não aplica rate limit ao health check
    return req.path === "/api/health";
  },
});

app.use(limiter);

// Body Parser com limite de tamanho
app.use(express.json({ limit: "10mb" }));

// Rotas da Aplicação
app.use("/api/auth", authRoutes); // Conecta o roteador prefixando com /api/auth
app.use("/api/spotify", spotifyRoutes); // Conecta o roteador prefixando com /api/spotify
app.use("/api/posts", postRoutes); // Conecta o roteador prefixando com /api/posts
app.use("/api/follow", followRoutes); // Conecta o roteador prefixando com /api/follow
app.use("/api/users", userRoutes); // Conecta o roteador prefixando com /api/users
app.use("/api/stories", storyRoutes); // Conecta o roteador prefixando com /api/stories
app.use("/api/top-four", topFourRoutes); // Conecta o roteador prefixando com /api/top-four

// Rota de Teste (Healthcheck)
app.get("/api/health", async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      status: "OK",
      message: "SellSong API está online e conectada ao banco de dados!",
      databaseUsers: userCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Erro ao conectar com o banco de dados",
      error: error instanceof Error ? error.message : error,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎵 Servidor do SellSong rodando em: http://localhost:${PORT}`);
});
