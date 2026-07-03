import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

/**
 * Extend Express Request to include the authenticated user.
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware that protects routes by requiring a valid JWT.
 * Extracts the token from the Authorization header (Bearer <token>).
 * On success, attaches `req.user` with { id, name, email }.
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Attach user payload (id, name, email) to the request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
