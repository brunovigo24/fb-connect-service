import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1h';

export interface ClientJwtPayload {
  clientId: string;
  name: string;
  scopes: string[];
}

export function generateToken(payload: ClientJwtPayload, options?: SignOptions): string {
  const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN, ...options };
  return jwt.sign(payload, JWT_SECRET, signOptions);
}

export function verifyToken(token: string): ClientJwtPayload & jwt.JwtPayload {
  return jwt.verify(token, JWT_SECRET) as ClientJwtPayload & jwt.JwtPayload;
}

