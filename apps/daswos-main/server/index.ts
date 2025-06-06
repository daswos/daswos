import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./init-db";
import apiRoutes from "./routes/index";
import { AutoShopService } from "./services/autoshop-service";
import { storage } from "./storage";

// Initialize express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add a root-level health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register API routes
app.use('/api', apiRoutes);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Run database initialization
  try {
    await initializeDatabase();
    log('Database initialization completed');
  } catch (error) {
    log(`Database initialization error: ${error}`, 'error');
    // Continue with server startup even if DB init fails
  }

  // Initialize AutoShop service
  try {
    const autoShopService = new AutoShopService(storage);
    await autoShopService.initialize();
    log('AutoShop service initialized');

    // Make the service available globally
    (global as any).autoShopService = autoShopService;
  } catch (error) {
    log(`AutoShop service initialization error: ${error}`, 'error');
    // Continue with server startup even if AutoShop init fails
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use the port from environment variable or default to 3000 (Fly.io internal_port)
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // For production environments like Fly.io, we need to listen on 0.0.0.0
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

  server.listen({
    port,
    host,
  }, () => {
    log(`serving on port ${port} with host ${host}`);
    console.log('\n');
    console.log('='.repeat(50));
    console.log(`🚀 Application is running at: http://${host}:${port}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔗 In development, access via http://localhost:${port}`);
    } else {
      console.log(`🔗 In production, the app will be available at your Fly.io URL (e.g., https://${process.env.FLY_APP_NAME}.fly.dev)`);
    }
    console.log('='.repeat(50));
    console.log('\n');
  });
})();
