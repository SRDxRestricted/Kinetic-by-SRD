import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * POST /api/auth/signup
 * Creates a new user account.
 * Body: { name, email, password }
 * Returns: { user: { id, name, email }, token }
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ──
    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters." });
      return;
    }

    // ── Check if user already exists ──
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(409).json({ message: "A user with this email already exists." });
      return;
    }

    // ── Hash password & create user ──
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
    });

    // ── Generate JWT with user id, name, email ──
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT.
 * Body: { email, password }
 * Returns: { user: { id, name, email }, token }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // ── Validation ──
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    // ── Find user ──
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // ── Compare passwords ──
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // ── Generate JWT with user id, name, email ──
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's info.
 * Requires: Bearer token (protected route).
 * Returns: { user: { id, name, email } }
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * POST /api/auth/logout
 * Logout is handled client-side by removing the JWT.
 * This endpoint exists for API completeness and can be
 * extended later to support token blacklisting.
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Logged out successfully." });
};
