import { useMemo, useRef, useEffect } from 'react';
import { MelodyNote } from '../types';

interface SingStarPitchBarProps {
  // Notas visíveis na janela atual
  visibleNotes: MelodyNote[];
  // Tempo atual do vídeo em segundos
  currentTime: number;
  // Nota atual que o usuário está cantando (ex: "C4", "A#3")
  userNote: string | null;
  // Frequência atual do usuário (para posicionamento preciso)
  userFrequency: number | null;
  // Janela de visualização em segundos (quanto tempo à frente mostrar)
  windowSize?: number;
  // Altura do componente
  height?: number;
}

// Range de MIDI notes para vocais (C3 a C6)
const MIN_MIDI = 48; // C3
const MAX_MIDI = 84; // C6
const MIDI_RANGE = MAX_MIDI - MIN_MIDI;

// Cores das notas por classe de pitch
const NOTE_COLORS: Record<string, string> = {
  C: '#ef4444',  // red
  D: '#f97316',  // orange
  E: '#eab308',  // yellow
  F: '#22c55e',  // green
  G: '#06b6d4',  // cyan
  A: '#3b82f6',  // blue
  B: '#a855f7',  // purple
};

// Converte frequência para número MIDI
function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}

// Extrai a nota base (sem oitava) de uma nota como "C#4"
function getBaseNote(note: string): string {
  return note.replace(/[0-9#b]/g, '').charAt(0);
}

// Obtém cor da nota
function getNoteColor(note: string): string {
  const base = getBaseNote(note);
  return NOTE_COLORS[base] || '#ffffff';
}

export function SingStarPitchBar({
  visibleNotes,
  currentTime,
  userNote,
  userFrequency,
  windowSize = 4,
  height = 120,
}: SingStarPitchBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcula posição Y baseado no MIDI
  const midiToY = useMemo(() => {
    return (midi: number, canvasHeight: number): number => {
      const clampedMidi = Math.max(MIN_MIDI, Math.min(MAX_MIDI, midi));
      const normalized = (clampedMidi - MIN_MIDI) / MIDI_RANGE;
      // Inverte porque Y cresce para baixo no canvas
      return canvasHeight - normalized * canvasHeight;
    };
  }, []);

  // Calcula posição X baseado no tempo
  const timeToX = useMemo(() => {
    return (time: number, canvasWidth: number): number => {
      // Linha do "agora" fica em 15% da largura
      const nowLineX = canvasWidth * 0.15;
      const pixelsPerSecond = (canvasWidth - nowLineX) / windowSize;
      return nowLineX + (time - currentTime) * pixelsPerSecond;
    };
  }, [currentTime, windowSize]);

  // Desenha o canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajusta tamanho do canvas
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const canvasHeight = height;

    // Limpa canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Fundo gradiente
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, canvasHeight);

    // Linhas de grade horizontais (notas)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let midi = MIN_MIDI; midi <= MAX_MIDI; midi += 2) {
      const y = midiToY(midi, canvasHeight);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Linha do "agora"
    const nowLineX = width * 0.15;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nowLineX, 0);
    ctx.lineTo(nowLineX, canvasHeight);
    ctx.stroke();

    // Glow na linha do agora
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(nowLineX, 0);
    ctx.lineTo(nowLineX, canvasHeight);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Desenha notas da melodia
    for (const note of visibleNotes) {
      const x = timeToX(note.time, width);
      const noteWidth = (note.duration * (width - nowLineX)) / windowSize;
      const y = midiToY(note.midi, canvasHeight);
      const noteHeight = Math.max(8, canvasHeight / MIDI_RANGE * 1.5);

      // Verifica se a nota está no "agora" (sendo cantada)
      const isActive = currentTime >= note.time && currentTime <= note.time + note.duration;

      // Cor da nota
      const color = getNoteColor(note.note);

      // Sombra/glow
      ctx.shadowColor = color;
      ctx.shadowBlur = isActive ? 20 : 8;

      // Barra da nota (retângulo arredondado)
      ctx.fillStyle = isActive ? color : `${color}99`; // 60% opacidade se não ativo
      ctx.beginPath();
      const radius = noteHeight / 2;
      ctx.roundRect(x, y - noteHeight / 2, noteWidth, noteHeight, radius);
      ctx.fill();

      // Borda
      ctx.strokeStyle = isActive ? '#ffffff' : `${color}`;
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    // Indicador do usuário (se está cantando)
    if (userFrequency && userFrequency > 50) {
      const userMidi = frequencyToMidi(userFrequency);
      const userY = midiToY(userMidi, canvasHeight);

      // Verifica se o usuário está afinado com alguma nota ativa
      const activeNote = visibleNotes.find(
        (note) => currentTime >= note.time && currentTime <= note.time + note.duration
      );

      let isOnPitch = false;
      if (activeNote) {
        const targetMidi = activeNote.midi;
        const midiDiff = Math.abs(userMidi - targetMidi);
        isOnPitch = midiDiff < 1; // Dentro de 1 semitom
      }

      // Círculo indicador do usuário
      const indicatorColor = isOnPitch ? '#22c55e' : '#ef4444'; // Verde se afinado, vermelho se não

      ctx.shadowColor = indicatorColor;
      ctx.shadowBlur = 15;

      // Círculo principal
      ctx.fillStyle = indicatorColor;
      ctx.beginPath();
      ctx.arc(nowLineX, userY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Borda branca
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Trail/rastro do usuário
      ctx.shadowBlur = 0;
      const gradient = ctx.createLinearGradient(nowLineX - 50, 0, nowLineX, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, `${indicatorColor}80`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(nowLineX - 50, userY);
      ctx.lineTo(nowLineX, userY);
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    // Labels das notas (à esquerda)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    const notesLabels = ['C3', 'C4', 'C5', 'C6'];
    for (const label of notesLabels) {
      const octave = parseInt(label.slice(1));
      const midi = 12 * (octave + 1); // C está no início de cada oitava
      const y = midiToY(midi, canvasHeight);
      ctx.fillText(label, 4, y + 3);
    }
  }, [visibleNotes, currentTime, userNote, userFrequency, windowSize, height, midiToY, timeToX]);

  // Se não há notas, não renderiza
  if (visibleNotes.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden border border-white/20"
      style={{ height }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
