import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

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
          return done(null, user);
        }
      } catch (err) {
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

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: Error | null, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Save the session cart items before login
      const sessionCartItems = req.session.cart || [];
      
      req.login(user, async (err) => {
        if (err) return next(err);
        
        try {
          // If there were items in the session cart, merge them with the user's database cart
          if (sessionCartItems.length > 0) {
            console.log(`Merging ${sessionCartItems.length} session cart items for user ${user.id}`);
            
            // Add each session cart item to the user's database cart
            for (const item of sessionCartItems) {
              if (item && item.productId) {
                // Get the latest product data to ensure we have accurate information
                const product = await storage.getProductById(item.productId);
                
                if (product) {
                  // Add the item to the user's database cart
                  await storage.addCartItem({
                    userId: user.id,
                    productId: item.productId,
                    quantity: item.quantity || 1,
                    source: item.source || 'manual'
                  });
                  console.log(`Added product ID ${item.productId} to user ${user.id}'s cart`);
                } else {
                  console.warn(`Product ID ${item.productId} from session cart not found in database`);
                }
              }
            }
            
            // Clear the session cart after merging
            req.session.cart = [];
            console.log('Session cart cleared after merging with database cart');
          }
          
          const userToReturn = { ...user } as any;
          delete userToReturn.password; // Don't send password back
          res.status(200).json(userToReturn);
        } catch (error) {
          console.error('Error merging carts during login:', error);
          // Still return success but log the error
          const userToReturn = { ...user } as any;
          delete userToReturn.password;
          res.status(200).json(userToReturn);
        }
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      // Explicitly destroy the session to ensure it's properly removed
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    const userToReturn = { ...req.user } as any;
    delete userToReturn.password; // Don't send password back
    
    // Let the database values be the source of truth for subscription status
    res.json(userToReturn);
  });
}