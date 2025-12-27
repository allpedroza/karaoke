import { useEffect, useState, useRef } from 'react';
import { MelodyNote, SongMelody, fetchMelody } from '../services/melody';

interface SingStarBarProps {
  songCode: string;
  currentTime: number; // Tempo atual do vídeo em segundos
  userNote: string | null; // Nota que o usuário está cantando (ex: "C4")
  isRecording: boolean;
}

export function SingStarBar({ songCode, currentTime, userNote, isRecording }: SingStarBarProps) {
  const [melody, setMelody] = useState<SongMelody | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Carregar melodia da música
  useEffect(() => {
    let mounted = true;

    async function loadMelody() {
      setLoading(true);
      const melodyData = await fetchMelody(songCode);
      if (mounted) {
        setMelody(melodyData);
        setLoading(false);
      }
    }

    loadMelody();

    return () => {
      mounted = false;
    };
  }, [songCode]);

  // Renderizar barra estilo SingStar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !melody || loading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Configurações
    const visibleDuration = 8; // Mostrar 8 segundos à frente
    const startTime = Math.max(0, currentTime - 1); // 1 segundo atrás
    const endTime = startTime + visibleDuration;

    // Encontrar faixa de notas (min/max)
    const visibleNotes = melody.notes.filter(
      (n) => n.time >= startTime && n.time <= endTime
    );

    if (visibleNotes.length === 0) return;

    // Extrair octava e índice de nota
    const getNoteValue = (note: string): number => {
      const noteMatch = note.match(/^([A-G]#?)(\d+)$/);
      if (!noteMatch) return 0;
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const [, noteName, octaveStr] = noteMatch;
      const octave = parseInt(octaveStr, 10);
      const noteIndex = noteNames.indexOf(noteName);
      return octave * 12 + noteIndex;
    };

    const allNoteValues = [
      ...visibleNotes.map((n) => getNoteValue(n.note)),
      userNote ? getNoteValue(userNote) : 0,
    ].filter((v) => v > 0);

    const minNote = Math.min(...allNoteValues) - 2; // Margem de 2 semitons
    const maxNote = Math.max(...allNoteValues) + 2;
    const noteRange = maxNote - minNote;

    // Função auxiliar: tempo -> posição X
    const timeToX = (time: number): number => {
      return ((time - startTime) / visibleDuration) * width;
    };

    // Função auxiliar: nota -> posição Y
    const noteToY = (note: string): number => {
      const value = getNoteValue(note);
      return height - ((value - minNote) / noteRange) * height;
    };

    // Desenhar linha vertical do tempo atual (indicador)
    const currentX = timeToX(currentTime);
    ctx.strokeStyle = '#ec4899'; // Rosa
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Desenhar notas da melodia (em azul/ciano)
    ctx.fillStyle = 'rgba(34, 211, 238, 0.6)'; // Ciano semi-transparente
    ctx.strokeStyle = 'rgba(34, 211, 238, 1)';
    ctx.lineWidth = 2;

    visibleNotes.forEach((note) => {
      const x = timeToX(note.time);
      const y = noteToY(note.note);
      const w = (note.duration / visibleDuration) * width;
      const h = 8; // Altura da barra

      // Barra da melodia
      ctx.fillRect(x, y - h / 2, w, h);
      ctx.strokeRect(x, y - h / 2, w, h);
    });

    // Desenhar nota do usuário (em verde/amarelo)
    if (isRecording && userNote) {
      const userY = noteToY(userNote);
      const userX = currentX - 20; // Centralizar na linha do tempo
      const userW = 40;
      const userH = 10;

      // Verificar se está próximo da nota correta
      const currentMelodyNote = melody.notes.find(
        (n) => Math.abs(n.time - currentTime) < 0.5
      );

      const isCorrect = currentMelodyNote
        ? Math.abs(getNoteValue(userNote) - getNoteValue(currentMelodyNote.note)) <= 1
        : false;

      ctx.fillStyle = isCorrect
        ? 'rgba(34, 197, 94, 0.8)' // Verde se correto
        : 'rgba(251, 191, 36, 0.8)'; // Amarelo se errado
      ctx.fillRect(userX, userY - userH / 2, userW, userH);

      ctx.strokeStyle = isCorrect ? 'rgba(34, 197, 94, 1)' : 'rgba(251, 191, 36, 1)';
      ctx.strokeRect(userX, userY - userH / 2, userW, userH);
    }

    // Desenhar linhas de grade (oitavas)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = minNote; i <= maxNote; i += 12) {
      const y = height - ((i - minNote) / noteRange) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [melody, currentTime, userNote, isRecording, loading]);

  if (loading) {
    return (
      <div className="w-full h-24 bg-gray-900/50 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-sm">Carregando melodia...</span>
      </div>
    );
  }

  if (!melody) {
    return (
      <div className="w-full h-24 bg-gray-900/50 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-sm">
          Melodia não disponível para esta música
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
        <span>🎵 Siga a melodia</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
            <span>Melodia</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Você (afinado)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Você (desafinado)</span>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full h-24 bg-black/80 rounded-lg border border-white/10"
      />
    </div>
  );
}
