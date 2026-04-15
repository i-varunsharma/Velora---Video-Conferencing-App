import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { logger } from '../utils/logger';

/**
 * UserController
 * Handles HTTP requests for user operations.
 */
export class UserController {
  /**
   * POST /api/users/sync
   * Creates or updates a user from Clerk data.
   */
  async syncUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { email, name, avatarUrl } = req.body as {
        email: string;
        name: string;
        avatarUrl?: string;
      };

      const user = await userService.syncUser({
        clerkId: req.auth.clerkId,
        email,
        name,
        avatarUrl,
      });

      res.status(200).json(user);
    } catch (error) {
      logger.error('Failed to sync user:', error);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  }

  /**
   * GET /api/users/me
   * Returns the current authenticated user's profile.
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await userService.getUserByClerkId(req.auth.clerkId);
      res.status(200).json(user);
    } catch (error) {
      logger.error('Failed to get user:', error);
      res.status(404).json({ error: 'User not found' });
    }
  }
}

export const userController = new UserController();
