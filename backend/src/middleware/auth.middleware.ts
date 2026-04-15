import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { env } from '../config/environment';
import { logger } from '../utils/logger';

// Extend Express Request to include auth data
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        clerkId: string;
      };
    }
  }
}

/**
 * Authentication middleware — verifies Clerk JWT from Authorization header.
 * Uses the standalone verifyToken function from @clerk/backend.
 * Attaches decoded user data to req.auth.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    try {
      const verifiedToken = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
      });

      req.auth = {
        userId: verifiedToken.sub,
        clerkId: verifiedToken.sub,
      };

      next();
    } catch {
      logger.warn('Invalid JWT token attempt');
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication service error' });
  }
}
