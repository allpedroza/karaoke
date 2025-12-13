import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { evaluationRoutes } from './routes/evaluation.js';
import { videosRoutes } from './routes/videos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api', evaluationRoutes);
app.use('/api/videos', videosRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    message: err.message || 'Erro interno do servidor',
  });
});

app.listen(PORT, () => {
  console.log(`🎤 Karaoke AI Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
