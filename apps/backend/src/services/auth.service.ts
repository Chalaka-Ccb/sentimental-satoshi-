import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12; 

export function signAccessToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'access' },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );
}

export async function register(email: string, password: string) {
  if (password.length < 8) throw new AppError(400, 'Password must be at least 8 characters');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  return issueTokenPair(user.id);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Constant-time comparison: always run bcrypt even if user not found
  const hash = user?.passwordHash ?? '$2b$12$invalidhashtopreventtiming';
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) throw new AppError(401, 'Invalid credentials');

  return issueTokenPair(user.id);
}

export async function refreshTokens(oldToken: string) {
  const session = await prisma.session.findUnique({
    where: { refreshToken: oldToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    // Clean up expired session
    if (session) await prisma.session.delete({ where: { id: session.id } });
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  // Rotate: delete old session, issue new pair
  await prisma.session.delete({ where: { id: session.id } });
  return issueTokenPair(session.userId);
}

async function issueTokenPair(userId: string) {
  const refreshToken = crypto.randomBytes(40).toString('hex');

  await prisma.session.create({
    data: {
      userId,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    accessToken: signAccessToken(userId),
    refreshToken,
    expiresIn: 15 * 60, // seconds
  };
}