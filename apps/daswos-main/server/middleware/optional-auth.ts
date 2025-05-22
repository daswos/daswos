import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Middleware to optionally authenticate a user
// If authentication fails, the request continues without a user
export const optionalAuthentication = async (req: Request, res: Response, next: NextFunction) => {
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

          console.log(`User optionally authenticated via token: ${user.username} (${user.id})`);
        }
      }
    } catch (error) {
      console.error('Error in optional authentication with token:', error);
    }
  }

  // Continue regardless of authentication result
  return next();
};
