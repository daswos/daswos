import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  if (!stored || !stored.includes(".")) {
    console.error("Invalid stored password format, missing salt separator");
    return false;
  }

  const [hashed, salt] = stored.split(".");

  if (!hashed || !salt) {
    console.error("Invalid stored password format, missing hash or salt");
    return false;
  }

  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "trustsphere-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production
      path: "/"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Check if the input looks like an email (contains @)
        const isEmail = username.includes('@');

        // Try to find user by email or username (case insensitive)
        let user;
        if (isEmail) {
          user = await storage.getUserByEmail(username);
        } else {
          user = await storage.getUserByUsername(username);
        }

        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Handle missing family_owner_id column gracefully
          try {
            // Check if familyOwnerId exists in the user object
            if (user.familyOwnerId === undefined) {
              console.log('Warning: familyOwnerId is undefined for user', user.id);
              // Add the missing property with a default value
              user.familyOwnerId = null;
            }
            return done(null, user);
          } catch (columnError) {
            console.error('Error accessing familyOwnerId:', columnError);
            // Still return the user, even if we couldn't add the missing property
            return done(null, user);
          }
        }
      } catch (err) {
        console.error('Error in LocalStrategy:', err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    return done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('Deserializing user ID:', id);

      // Handle special hardcoded admin user
      if (id === 999999) {
        console.log('Deserializing hardcoded admin user');
        return done(null, {
          id: 999999,
          username: 'admin',
          email: 'admin@daswos.com',
          fullName: 'Admin User',
          isAdmin: true,
          isSeller: false,
          createdAt: new Date(),
          // Add required User properties for TypeScript compatibility
          password: '',
          avatar: null,
          hasSubscription: false,
          subscriptionType: null,
          subscriptionExpiresAt: null,
          isFamilyOwner: false,
          familyOwnerId: null, // Add the missing property
          parentAccountId: null,
          isChildAccount: false,
          superSafeMode: false,
          superSafeSettings: {},
          safeSphereActive: false,
          aiShopperEnabled: false,
          aiShopperSettings: {},
          dasWosCoins: 0
        });
      }

      // Regular user lookup
      const user = await storage.getUser(id);
      if (!user) {
        console.log('User not found in database:', id);
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      console.error('Error deserializing user:', err);
      // Return false instead of error to prevent breaking the app
      return done(null, false);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists using storage interface
      const existingUserByName = await storage.getUserByUsername(req.body.username);
      if (existingUserByName) {
        console.log('Found existing user by username:', existingUserByName.id);
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists using storage interface
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        console.log('Found existing user by email:', existingUserByEmail.id);
        return res.status(400).json({ error: "Email already in use" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const userToReturn = { ...user } as any;
        delete userToReturn.password; // Don't send password back

        // Set a flag to indicate this is a new registration
        // The client will use this to redirect to the subscription page
        userToReturn.isNewRegistration = true;

        res.status(201).json(userToReturn);
      });
    } catch (err) {
      next(err);
    }
  });

  // New endpoint to validate registration data without creating a user
  app.post("/api/validate-registration", async (req, res) => {
    try {
      // Check if username already exists using storage interface
      const existingUserByName = await storage.getUserByUsername(req.body.username);
      if (existingUserByName) {
        console.log('Validate registration - Found existing user by username:', existingUserByName.id);
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists using storage interface
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);
      if (existingUserByEmail) {
        console.log('Validate registration - Found existing user by email:', existingUserByEmail.id);
        return res.status(400).json({ error: "Email already in use" });
      }

      // Data is valid, return success
      res.status(200).json({ valid: true });
    } catch (err) {
      console.error('Validate registration - Server error:', err);
      res.status(500).json({ error: "Server error validating registration data" });
    }
  });

  app.post("/api/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Add more detailed logging
      console.log(`Login attempt for username: ${username}`);

      try {
        // Try to get the user from the database
        const user = await storage.getUserByUsername(username);

        if (!user) {
          console.log(`User not found: ${username}`);
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          console.log(`Invalid password for user: ${username}`);
          return res.status(401).json({ error: "Invalid credentials" });
        }

        console.log(`User authenticated successfully: ${username} (ID: ${user.id})`);

        // Handle missing family_owner_id column gracefully
        try {
          // Check if familyOwnerId exists in the user object
          if (user.familyOwnerId === undefined) {
            console.log('Warning: familyOwnerId is undefined for user', user.id);
            // Add the missing property with a default value
            user.familyOwnerId = null;
          }
        } catch (columnError) {
          console.error('Error accessing familyOwnerId:', columnError);
          // Continue with login even if we couldn't add the missing property
        }

        // Create new session
        const sessionToken = uuidv4();
        const deviceInfo = {
          userAgent: req.headers['user-agent'],
          ip: req.ip
        };

        // Create session in database
        try {
          const session = await storage.createUserSession({
            userId: user.id,
            sessionToken,
            deviceInfo,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          });

          // Also create a passport session for compatibility
          req.login(user, (loginErr) => {
            if (loginErr) {
              console.error("Error in passport login:", loginErr);
              // Continue anyway since we have the token-based session
            }

            // Return user info and session token
            const userInfo = { ...user };
            delete userInfo.password;

            res.json({
              user: userInfo,
              sessionToken,
              expiresAt: session.expiresAt
            });
          });
        } catch (sessionError) {
          console.error("Error creating session:", sessionError);

          // Even if session creation fails, we can still log the user in
          // Return user info without session token
          const userInfo = { ...user };
          delete userInfo.password;

          res.json({
            user: userInfo,
            message: "Logged in with limited functionality"
          });
        }
      } catch (dbError) {
        console.error("Database error during login:", dbError);
        return res.status(500).json({ error: "Database error, please try again" });
      }
    } catch (error) {
      console.error("Unexpected error in login endpoint:", error);
      next(error);
    }
  });

  // New endpoint to get all active sessions for a user
  app.get("/api/sessions", async (req, res) => {
    const sessions = await storage.getUserSessions(req.user?.id);
    res.json(sessions);
  });

  // Modified logout endpoint
  app.post("/api/logout", async (req, res) => {
    const { sessionToken } = req.body;
    await storage.deactivateSession(sessionToken);

    // Also destroy the session if it exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });
    }

    // Clear authentication
    req.logout((err) => {
      if (err) {
        console.error("Error logging out:", err);
      }
    });

    res.sendStatus(200);
  });

  // Logout all sessions
  app.post("/api/logout-all", async (req, res) => {
    await storage.deactivateAllUserSessions(req.user?.id);
    res.sendStatus(200);
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    const userToReturn = { ...req.user } as any;
    delete userToReturn.password; // Don't send password back

    // Let the database values be the source of truth for subscription status
    res.json(userToReturn);
  });
}
