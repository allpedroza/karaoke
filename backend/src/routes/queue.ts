/**
 * Queue Routes
 * API para gerenciar a fila de músicas do karaokê
 * Permite que múltiplos dispositivos (celulares) adicionem músicas à fila
 */

import { Router, Request, Response } from 'express';
import { getSongByCode } from '../data/songCatalog.js';

const router = Router();

// Interface para item da fila
interface QueueItem {
  id: string;
  songCode: string;
  songTitle: string;
  artist: string;
  thumbnail: string;
  singerName: string;
  addedAt: Date;
}

// Fila em memória (persistente enquanto o servidor estiver rodando)
let songQueue: QueueItem[] = [];
const MAX_QUEUE_SIZE = 20;

// Gerar ID único
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/queue - Listar fila atual
router.get('/', (_req: Request, res: Response) => {
  res.json({
    queue: songQueue,
    count: songQueue.length,
    maxSize: MAX_QUEUE_SIZE,
  });
});

// POST /api/queue - Adicionar música à fila
router.post('/', (req: Request, res: Response) => {
  const { songCode, singerName } = req.body;

  if (!songCode || !singerName) {
    res.status(400).json({ error: 'songCode e singerName são obrigatórios' });
    return;
  }

  if (songQueue.length >= MAX_QUEUE_SIZE) {
    res.status(400).json({ error: 'Fila cheia! Máximo de 20 músicas.' });
    return;
  }

  // Buscar dados da música
  const song = getSongByCode(songCode);
  if (!song) {
    res.status(404).json({ error: 'Música não encontrada' });
    return;
  }

  // Verificar se já existe na fila para o mesmo cantor
  const alreadyInQueue = songQueue.some(
    item => item.songCode === songCode && item.singerName.toLowerCase() === singerName.toLowerCase()
  );

  if (alreadyInQueue) {
    res.status(400).json({ error: 'Esta música já está na fila para este cantor!' });
    return;
  }

  const newItem: QueueItem = {
    id: generateId(),
    songCode,
    songTitle: song.song,
    artist: song.artist,
    thumbnail: `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`,
    singerName: singerName.trim(),
    addedAt: new Date(),
  };

  songQueue.push(newItem);

  console.log(`🎵 Adicionado à fila: [${songCode}] ${song.song} - ${singerName}`);

  res.status(201).json({
    item: newItem,
    position: songQueue.length,
    message: `Música adicionada! Posição na fila: ${songQueue.length}`,
  });
});

// DELETE /api/queue/:id - Remover música da fila
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const index = songQueue.findIndex(item => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Item não encontrado na fila' });
    return;
  }

  const removed = songQueue.splice(index, 1)[0];

  console.log(`🗑️ Removido da fila: [${removed.songCode}] ${removed.songTitle} - ${removed.singerName}`);

  res.json({ success: true, removed });
});

// POST /api/queue/next - Pegar próxima música (remove da fila)
router.post('/next', (_req: Request, res: Response) => {
  if (songQueue.length === 0) {
    res.status(404).json({ error: 'Fila vazia' });
    return;
  }

  const nextItem = songQueue.shift()!;

  console.log(`▶️ Próxima música: [${nextItem.songCode}] ${nextItem.songTitle} - ${nextItem.singerName}`);

  res.json({
    item: nextItem,
    remainingCount: songQueue.length,
  });
});

// DELETE /api/queue - Limpar toda a fila
router.delete('/', (_req: Request, res: Response) => {
  const count = songQueue.length;
  songQueue = [];

  console.log(`🧹 Fila limpa (${count} itens removidos)`);

  res.json({ success: true, removedCount: count });
});

// PUT /api/queue/reorder - Reordenar fila
router.put('/reorder', (req: Request, res: Response) => {
  const { fromIndex, toIndex } = req.body;

  if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
    res.status(400).json({ error: 'fromIndex e toIndex são obrigatórios' });
    return;
  }

  if (fromIndex < 0 || fromIndex >= songQueue.length || toIndex < 0 || toIndex >= songQueue.length) {
    res.status(400).json({ error: 'Índices inválidos' });
    return;
  }

  const [item] = songQueue.splice(fromIndex, 1);
  songQueue.splice(toIndex, 0, item);

  res.json({ success: true, queue: songQueue });
});

export default router;
