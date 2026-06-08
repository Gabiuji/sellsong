import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
