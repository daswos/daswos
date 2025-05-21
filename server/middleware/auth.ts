import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Middleware to check if user is authenticated via session or token
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  // First check if user is authenticated via session
  if (req.user) {
    return next();
  }

  // If not authenticated via session, check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Find the session by token
      const sessions = await storage.getUserSessions(null);
      const session = sessions.find(s => s.sessionToken === token && s.isActive);

      if (session) {
        // Get the user associated with this session
        const user = await storage.getUser(session.userId);
        if (user) {
          // Set the user on the request
          req.user = user;

          // Set isAuthenticated method to return true
          const originalIsAuthenticated = req.isAuthenticated;
          req.isAuthenticated = function() {
            return true;
          };

          console.log(`User authenticated via token: ${user.username} (${user.id})`);
          return next();
        }
      }
    } catch (error) {
      console.error('Error authenticating with token:', error);
    }
  }

  // If we get here, the user is not authenticated
  return res.status(401).json({ error: 'Not authenticated' });
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user as any).isAdmin) {
    return next();
  }
  return res.status(403).json({ error: 'Not authorized' });
};