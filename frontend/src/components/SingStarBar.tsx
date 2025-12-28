import { useEffect, useState, useRef, useCallback } from 'react';
import { MelodyMap, MelodyNote } from '../types';
import { getMelodyMap } from '../services/api';

interface SingStarBarProps {
  songCode: string;
  currentTime: number; // Tempo atual do vídeo em segundos
  userNote: string | null; // Nota que o usuário está cantando (ex: "C4")
  userFrequency?: number | null; // Frequência atual do usuário
  isRecording: boolean;
  height?: number; // Altura da barra (para resize)
  onHeightChange?: (height: number) => void; // Callback quando altura mudar
}

// Converte frequência para número MIDI
function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}

// Converte nota para MIDI
function noteToMidi(note: string): number {
  const noteMatch = note.match(/^([A-G]#?)(\d+)$/);
  if (!noteMatch) return 60; // C4 default
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const [, noteName, octaveStr] = noteMatch;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = noteNames.indexOf(noteName);
  return (octave + 1) * 12 + noteIndex;
}

// Range de MIDI notes para vocais (C3 a C6)
const MIN_MIDI = 48; // C3
const MAX_MIDI = 84; // C6
const MIDI_RANGE = MAX_MIDI - MIN_MIDI;

// Cores das notas por classe de pitch (estilo SingStar)
const NOTE_COLORS: Record<string, string> = {
  C: '#ef4444',  // red
  D: '#f97316',  // orange
  E: '#eab308',  // yellow
  F: '#22c55e',  // green
  G: '#06b6d4',  // cyan
  A: '#3b82f6',  // blue
  B: '#a855f7',  // purple
};

// Extrai a nota base (sem oitava)
function getBaseNote(note: string): string {
  return note.replace(/[0-9#b]/g, '').charAt(0);
}

// Obtém cor da nota
function getNoteColor(note: string): string {
  const base = getBaseNote(note);
  return NOTE_COLORS[base] || '#22d3ee'; // cyan default
}

export function SingStarBar({
  songCode,
  currentTime,
  userNote,
  userFrequency,
  isRecording,
  height = 240,
  onHeightChange,
}: SingStarBarProps) {
  const [melodyMap, setMelodyMap] = useState<MelodyMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado para resize
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(height);

  // Carregar melodia da música via API do backend
  useEffect(() => {
    let mounted = true;

    async function loadMelody() {
      setLoading(true);
      setError(null);
      try {
        const data = await getMelodyMap(songCode);
        if (mounted) {
          if (data && data.status === 'ready' && data.notes.length > 0) {
            setMelodyMap(data);
            console.log(`[SingStarBar] Loaded ${data.notes.length} notes for ${songCode}`);
          } else {
            console.warn(`[SingStarBar] No melody data for ${songCode}`, data);
            setMelodyMap(null);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('[SingStarBar] Error loading melody:', err);
          setError('Erro ao carregar melodia');
          setLoading(false);
        }
      }
    }

    loadMelody();

    return () => {
      mounted = false;
    };
  }, [songCode]);

  // Calcula posição Y baseado no MIDI
  const midiToY = useCallback((midi: number, canvasHeight: number): number => {
    const clampedMidi = Math.max(MIN_MIDI, Math.min(MAX_MIDI, midi));
    const normalized = (clampedMidi - MIN_MIDI) / MIDI_RANGE;
    // Inverte porque Y cresce para baixo no canvas
    return canvasHeight - normalized * canvasHeight;
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    resizeStartY.current = clientY;
    resizeStartHeight.current = height;
  }, [height]);

  const handleResize = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = clientY - resizeStartY.current;
    const newHeight = Math.max(120, Math.min(500, resizeStartHeight.current + delta));
    onHeightChange?.(newHeight);
  }, [isResizing, onHeightChange]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResize);
      window.addEventListener('touchend', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchmove', handleResize);
      window.removeEventListener('touchend', handleResizeEnd);
    };
  }, [isResizing, handleResize, handleResizeEnd]);

  // Renderizar barra estilo SingStar
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !melodyMap || loading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajusta tamanho do canvas para alta resolução
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const canvasHeight = height;

    // Limpar canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Configurações estilo SingStar
    const windowSize = 6; // Mostrar 6 segundos à frente
    const nowLineX = width * 0.15; // Linha do "agora" em 15%

    // Função auxiliar: tempo -> posição X
    const timeToX = (time: number): number => {
      const pixelsPerSecond = (width - nowLineX) / windowSize;
      return nowLineX + (time - currentTime) * pixelsPerSecond;
    };

    // Encontrar notas visíveis
    const startTime = currentTime - 1;
    const endTime = currentTime + windowSize;
    const visibleNotes = melodyMap.notes.filter((n: MelodyNote) => {
      const noteEnd = n.time + n.duration;
      return noteEnd >= startTime && n.time <= endTime;
    });

    // Linhas de grade horizontais (notas)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let midi = MIN_MIDI; midi <= MAX_MIDI; midi += 2) {
      const y = midiToY(midi, canvasHeight);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Linha do "agora" (estilo SingStar - vertical luminosa)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nowLineX, 0);
    ctx.lineTo(nowLineX, canvasHeight);
    ctx.stroke();

    // Glow na linha do agora
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(nowLineX, 0);
    ctx.lineTo(nowLineX, canvasHeight);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Desenha notas da melodia (estilo SingStar - barras coloridas arredondadas)
    for (const note of visibleNotes) {
      // Usa o midi direto se disponível, senão calcula a partir da nota
      const midi = note.midi || noteToMidi(note.note);
      const x = timeToX(note.time);
      const noteWidth = Math.max(10, (note.duration * (width - nowLineX)) / windowSize);
      const y = midiToY(midi, canvasHeight);
      const noteHeight = Math.max(12, canvasHeight / MIDI_RANGE * 2.5);

      // Verifica se a nota está no "agora" (sendo cantada)
      const isActive = currentTime >= note.time && currentTime <= note.time + note.duration;

      // Cor da nota baseada na nota musical
      const color = getNoteColor(note.note);

      // Sombra/glow
      ctx.shadowColor = color;
      ctx.shadowBlur = isActive ? 25 : 10;

      // Barra da nota (retângulo arredondado estilo SingStar)
      ctx.fillStyle = isActive ? color : `${color}aa`; // Mais opaco
      ctx.beginPath();
      const radius = noteHeight / 2;
      ctx.roundRect(x, y - noteHeight / 2, noteWidth, noteHeight, radius);
      ctx.fill();

      // Borda luminosa
      ctx.strokeStyle = isActive ? '#ffffff' : `${color}`;
      ctx.lineWidth = isActive ? 3 : 2;
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    // Indicador do usuário (se está cantando)
    const actualFrequency = userFrequency || (userNote ? noteToMidi(userNote) * 8.18 : null);
    if (actualFrequency && actualFrequency > 50 && isRecording) {
      const userMidi = userFrequency ? frequencyToMidi(userFrequency) : noteToMidi(userNote || 'C4');
      const userY = midiToY(userMidi, canvasHeight);

      // Verifica se o usuário está afinado com alguma nota ativa
      const activeNote = visibleNotes.find(
        (note: MelodyNote) => currentTime >= note.time && currentTime <= note.time + note.duration
      );

      let isOnPitch = false;
      if (activeNote) {
        const targetMidi = activeNote.midi || noteToMidi(activeNote.note);
        const midiDiff = Math.abs(userMidi - targetMidi);
        isOnPitch = midiDiff < 1.5; // Dentro de 1.5 semitom
      }

      // Cor do indicador (verde se afinado, vermelho se não)
      const indicatorColor = isOnPitch ? '#22c55e' : '#ef4444';

      ctx.shadowColor = indicatorColor;
      ctx.shadowBlur = 20;

      // Círculo principal do usuário
      ctx.fillStyle = indicatorColor;
      ctx.beginPath();
      ctx.arc(nowLineX, userY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Borda branca brilhante
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Trail/rastro do usuário (linha à esquerda)
      ctx.shadowBlur = 0;
      const gradient = ctx.createLinearGradient(nowLineX - 80, 0, nowLineX, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, `${indicatorColor}99`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(nowLineX - 80, userY);
      ctx.lineTo(nowLineX, userY);
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    // Labels das notas (à esquerda)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    const notesLabels = ['C3', 'C4', 'C5', 'C6'];
    for (const label of notesLabels) {
      const midi = noteToMidi(label);
      const y = midiToY(midi, canvasHeight);
      ctx.fillText(label, 4, y + 4);
    }
  }, [melodyMap, currentTime, userNote, userFrequency, isRecording, loading, height, midiToY]);

  if (loading) {
    return (
      <div className="w-full bg-gray-900/50 rounded-lg flex items-center justify-center" style={{ height }}>
        <span className="text-gray-400 text-sm">Carregando melodia...</span>
      </div>
    );
  }

  if (error || !melodyMap) {
    return (
      <div className="w-full bg-gray-900/50 rounded-lg flex items-center justify-center" style={{ height }}>
        <span className="text-gray-400 text-sm">
          {error || 'Melodia não disponível para esta música'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="opacity-70">Siga a melodia</span>
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50"></div>
            <span>Melodia</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
            <span>Você (afinado)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
            <span>Você (desafinado)</span>
          </div>
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative w-full rounded-lg overflow-hidden border border-white/20"
        style={{ height }}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        {/* Handle de resize na borda inferior */}
        {onHeightChange && (
          <div
            className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center bg-gradient-to-t from-white/10 to-transparent hover:from-white/20 transition-colors"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          >
            <div className="w-12 h-1 rounded-full bg-white/40"></div>
          </div>
        )}
      </div>
    </div>
  );
}
