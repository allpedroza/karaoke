import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { evaluationRoutes } from './routes/evaluation.js';
import { videosRoutes } from './routes/videos.js';
import { rankingsRoutes } from './routes/rankings.js';
import melodyRoutes from './routes/melody.js';
import queueRoutes from './routes/queue.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api', evaluationRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/melody', melodyRoutes);
app.use('/api/queue', queueRoutes);

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

// Escutar em 0.0.0.0 para aceitar conexões de outros dispositivos na rede
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🎤 Karaoke AI Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📱 Para acessar de outros dispositivos na rede, use o IP local da máquina`);
});
