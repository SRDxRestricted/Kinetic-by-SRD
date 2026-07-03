import jwt from "jsonwebtoken";
import { config } from "../config";

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
}

/**
 * Generate a JWT token containing user id, name, and email.
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

/**
 * Verify and decode a JWT token.
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
