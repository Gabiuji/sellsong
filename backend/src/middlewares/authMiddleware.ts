import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não está configurado no .env");
}

// Interface para estender o comportamento do Request do Express
// e permitir que injetemos os dados do usuário autenticado nele
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Pega o token enviado no cabeçalho da requisição (Authorization Header)
  const authHeader = req.headers.authorization;

  // O padrão de mercado para tokens no Header é: "Bearer <TOKEN_AQUI>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Acesso negado. Token não fornecido." });
    return;
  }

  // Extrai apenas a string do token, removendo a palavra "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // Valida se o token é legítimo e descriptografa os dados guardados nele
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
    };

    // Injeta os dados do usuário dentro da requisição atual.
    // Assim, os controllers de Posts saberão exatamente QUEM está postando.
    req.user = decoded;

    // Se está tudo certo, deixa a requisição seguir viagem para o controller!
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};
