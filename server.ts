import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/server/config/db.js';
import { authenticate } from './src/server/middleware/auth.js';
import { errorHandler } from './src/server/middleware/errorHandler.js';
import { apiRouter } from './src/server/routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security & parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom auth decoder for all requests
app.use(authenticate);

// Mount API routes
app.use('/api/v1', apiRouter);

// Database initialization
await connectDB();

// Vite integration for development or static serving for production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BasketWise] Server listening on http://0.0.0.0:${PORT}`);
});

export default app;
