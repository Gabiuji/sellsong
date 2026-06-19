import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  validatePasswordStrength,
  validateEmail,
  validateUsername,
} from "../utils/validators.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não está configurado");
}

// ==========================================
// REGISTRO / CADASTRO DE USUÁRIO
// ==========================================
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // ==========================================
    // VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
    // ==========================================
    if (!username || !email || !password) {
      res.status(400).json({ error: "Todos os campos são obrigatórios." });
      return;
    }

    // ==========================================
    // VALIDAÇÃO DE EMAIL
    // ==========================================
    if (!validateEmail(email)) {
      res.status(400).json({ error: "E-mail inválido." });
      return;
    }

    // ==========================================
    // VALIDAÇÃO DE USERNAME
    // ==========================================
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      res.status(400).json({ error: usernameValidation.error });
      return;
    }

    // ==========================================
    // VALIDAÇÃO DE FORÇA DE SENHA
    // ==========================================
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        error: "Senha fraca",
        details: passwordValidation.errors,
      });
      return;
    }

    // Verifica se o e-mail já está cadastrado
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      res.status(400).json({ error: "Este e-mail já está em uso." });
      return;
    }

    // Verifica se o username já está cadastrado
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      res.status(400).json({ error: "Este nome de usuário já está em uso." });
      return;
    }

    // Criptografa a senha antes de salvar (Salt de 10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Retorna os dados do usuário criado (OMITINDO a senha por segurança)
    res.status(201).json({
      message: "Usuário registrado com sucesso!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor ao registrar usuário." });
  }
};

// ==========================================
// LOGIN / AUTENTICAÇÃO
// ==========================================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      return;
    }

    // Busca o usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Credenciais inválidas." });
      return;
    }

    // Compara a senha digitada com o hash salvo no banco
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Credenciais inválidas." });
      return;
    }

    // Se a senha for válida, gera o Token JWT (expira em 24 horas)
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );

    // Retorna o token e os dados públicos do usuário
    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor ao fazer login." });
  }
};
