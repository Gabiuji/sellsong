import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRouter.js";
import spotifyRoutes from "./routes/spotifyRouter.js";
import postRoutes from "./routes/postRouter.js";
import followRoutes from "./routes/followRouter.js";
import userRoutes from "./routes/userRouter.js";
import storyRoutes from "./routes/storyRouter.js";

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

// Middlewares Globais
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Rotas da Aplicação
app.use("/api/auth", authRoutes); // Conecta o roteador prefixando com /api/auth
app.use("/api/spotify", spotifyRoutes); // Conecta o roteador prefixando com /api/spotify
app.use("/api/posts", postRoutes); // Conecta o roteador prefixando com /api/posts
app.use("/api/follow", followRoutes); // Conecta o roteador prefixando com /api/follow
app.use("/api/users", userRoutes); // Conecta o roteador prefixando com /api/users
app.use("/api/stories", storyRoutes); // Conecta o roteador prefixando com /api/stories

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
