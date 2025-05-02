import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./init-db";
import apiRoutes from "./routes/index";

// Initialize express application
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

  // Use the port from environment variable or default to 3003
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;
  server.listen({
    port,
    host: "127.0.0.1",
  }, () => {
    log(`serving on port ${port}`);
    console.log('\n');
    console.log('='.repeat(50));
    console.log(`🚀 Application is running at: http://localhost:${port}`);
    console.log(`🔗 Click the link above or copy it to your browser`);
    console.log('='.repeat(50));
    console.log('\n');
  });
})();
