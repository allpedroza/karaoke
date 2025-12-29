import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { MelodyMap, MelodyNote } from '../types';
import { getMelodyMap, saveMelodySyncOffset } from '../services/api';

interface SingStarBarProps {
  songCode: string;
  currentTime: number; // Tempo atual do vídeo em segundos
  userNote: string | null; // Nota que o usuário está cantando (ex: "C4")
  userFrequency?: number | null; // Frequência atual do usuário
  isRecording: boolean;
  height?: number; // Altura da barra (para resize)
  onHeightChange?: (height: number) => void; // Callback quando altura mudar
  syncOffset?: number; // Offset em segundos para sincronizar com o vídeo (positivo = melodia atrasada)
  onSyncOffsetChange?: (offset: number) => void; // Callback para ajustar offset
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

// Converte MIDI para nome da nota
function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${noteNames[noteIndex]}${octave}`;
}

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
  syncOffset = 0,
  onSyncOffsetChange,
}: SingStarBarProps) {
  const [melodyMap, setMelodyMap] = useState<MelodyMap | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado para resize
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(height);

  // Estado para salvar sync offset
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Histórico de pitch do usuário (para modo sem melodia de referência)
  const pitchHistoryRef = useRef<Array<{ time: number; midi: number }>>([]);
  const MAX_HISTORY_SECONDS = 8; // Manter histórico de 8 segundos

  // Range MIDI estável para fallback (só expande, nunca contrai durante a sessão)
  const stableMidiRangeRef = useRef<{ min: number; max: number }>({ min: 60, max: 72 }); // Default C4-C5

  // Carregar melodia da música via API do backend
  useEffect(() => {
    let mounted = true;

    async function loadMelody() {
      setLoading(true);
      try {
        const data = await getMelodyMap(songCode);
        if (mounted) {
          if (data && (data.status === 'ready' || data.status === 'completed') && data.notes.length > 0) {
            setMelodyMap(data);
            console.log(`[SingStarBar] Loaded ${data.notes.length} notes for ${songCode}, saved offset: ${data.sync_offset ?? 0}s`);
            // Se existe offset salvo e o parent permite alteração, aplicar
            if (onSyncOffsetChange && data.sync_offset && data.sync_offset !== 0) {
              onSyncOffsetChange(data.sync_offset);
            }
          } else {
            console.warn(`[SingStarBar] No melody data for ${songCode}`, data);
            setMelodyMap(null);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('[SingStarBar] Error loading melody:', err);
          setMelodyMap(null); // Will trigger fallback mode
          setLoading(false);
        }
      }
    }

    loadMelody();

    return () => {
      mounted = false;
    };
  }, [songCode, onSyncOffsetChange]);

  // Calcula range MIDI dinâmico baseado nas notas da melodia
  const { minMidi, maxMidi, midiRange } = useMemo(() => {
    if (!melodyMap || melodyMap.notes.length === 0) {
      return { minMidi: 48, maxMidi: 84, midiRange: 36 }; // Default C3-C6
    }

    let min = Infinity;
    let max = -Infinity;

    for (const note of melodyMap.notes) {
      const midi = note.midi || noteToMidi(note.note);
      if (midi < min) min = midi;
      if (midi > max) max = midi;
    }

    // Adiciona padding de 3 semitons acima e abaixo
    const padding = 3;
    min = Math.max(36, min - padding); // No mínimo C2
    max = Math.min(96, max + padding); // No máximo C7

    // Garante range mínimo de 12 semitons (1 oitava)
    const range = max - min;
    if (range < 12) {
      const expand = Math.ceil((12 - range) / 2);
      min = Math.max(36, min - expand);
      max = Math.min(96, max + expand);
    }

    console.log(`[SingStarBar] Dynamic MIDI range: ${midiToNoteName(min)} (${min}) to ${midiToNoteName(max)} (${max})`);

    return { minMidi: min, maxMidi: max, midiRange: max - min };
  }, [melodyMap]);

  // Calcula posição Y baseado no MIDI (com range dinâmico)
  const midiToY = useCallback((midi: number, canvasHeight: number): number => {
    const clampedMidi = Math.max(minMidi, Math.min(maxMidi, midi));
    const normalized = (clampedMidi - minMidi) / midiRange;
    // Inverte porque Y cresce para baixo no canvas
    return canvasHeight - normalized * canvasHeight;
  }, [minMidi, maxMidi, midiRange]);

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

  // Ajuste de sync offset com teclas
  const adjustOffset = useCallback((delta: number) => {
    if (onSyncOffsetChange) {
      onSyncOffsetChange(syncOffset + delta);
    }
  }, [syncOffset, onSyncOffsetChange]);

  // Salvar sync offset no backend
  const handleSaveOffset = useCallback(async () => {
    if (isSaving || !songCode) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await saveMelodySyncOffset(songCode, syncOffset);
      setSaveMessage('✓ Salvo');
      console.log(`[SingStarBar] Sync offset saved: ${syncOffset}s for ${songCode}`);

      // Limpa mensagem após 2 segundos
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      console.error('[SingStarBar] Error saving sync offset:', err);
      setSaveMessage('✗ Erro');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [songCode, syncOffset, isSaving]);

  // Tempo ajustado com offset
  const adjustedTime = currentTime + syncOffset;

  // Atualiza histórico de pitch do usuário
  useEffect(() => {
    if (!isRecording) return;

    const actualFrequency = userFrequency || (userNote ? noteToMidi(userNote) * 8.18 : null);
    if (actualFrequency && actualFrequency > 50) {
      const userMidi = userFrequency ? frequencyToMidi(userFrequency) : noteToMidi(userNote || 'C4');

      // Adiciona nova amostra
      pitchHistoryRef.current.push({ time: currentTime, midi: userMidi });

      // Remove amostras antigas
      const cutoffTime = currentTime - MAX_HISTORY_SECONDS;
      pitchHistoryRef.current = pitchHistoryRef.current.filter(p => p.time >= cutoffTime);
    }
  }, [currentTime, userFrequency, userNote, isRecording]);

  // Range MIDI para modo fallback (estável - só expande, nunca contrai)
  const fallbackMidiRange = useMemo(() => {
    if (melodyMap) return { minMidi: 48, maxMidi: 84, midiRange: 36 };

    const history = pitchHistoryRef.current;
    const stableRange = stableMidiRangeRef.current;

    if (history.length > 0) {
      // Encontra o range atual do histórico
      const historyMin = Math.min(...history.map(p => p.midi));
      const historyMax = Math.max(...history.map(p => p.midi));

      // Só expande o range, nunca contrai (evita oscilação visual)
      if (historyMin < stableRange.min) {
        stableRange.min = Math.max(36, historyMin - 3);
      }
      if (historyMax > stableRange.max) {
        stableRange.max = Math.min(96, historyMax + 3);
      }
    }

    // Garante range mínimo de 12 semitons
    let { min, max } = stableRange;
    if (max - min < 12) {
      const expand = Math.ceil((12 - (max - min)) / 2);
      min = Math.max(36, min - expand);
      max = Math.min(96, max + expand);
    }

    return { minMidi: min, maxMidi: max, midiRange: max - min };
  }, [melodyMap, currentTime]);

  // Renderiza visualizador de pitch quando NÃO tem melodia de referência
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    // Renderiza se não tem melody map ou se teve erro (mas só se não está carregando)
    if (!canvas || !container || loading || melodyMap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const canvasHeight = height;

    ctx.clearRect(0, 0, width, canvasHeight);

    const { minMidi: fMinMidi, maxMidi: fMaxMidi, midiRange: fMidiRange } = fallbackMidiRange;

    // Função para converter MIDI para Y
    const midiToYFallback = (midi: number): number => {
      const clamped = Math.max(fMinMidi, Math.min(fMaxMidi, midi));
      const normalized = (clamped - fMinMidi) / fMidiRange;
      return canvasHeight - normalized * canvasHeight;
    };

    // Linhas de grade horizontais
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let midi = fMinMidi; midi <= fMaxMidi; midi += 2) {
      const y = midiToYFallback(midi);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Linha do "agora"
    const nowLineX = width * 0.85; // Posição mais à direita no modo fallback

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nowLineX, 0);
    ctx.lineTo(nowLineX, canvasHeight);
    ctx.stroke();

    // Desenha histórico de pitch como trail colorido
    const history = pitchHistoryRef.current;
    if (history.length > 1) {
      const windowSize = MAX_HISTORY_SECONDS;
      const pixelsPerSecond = nowLineX / windowSize;

      // Desenha linha conectando os pontos
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1];
        const curr = history[i];

        const x1 = nowLineX - (currentTime - prev.time) * pixelsPerSecond;
        const x2 = nowLineX - (currentTime - curr.time) * pixelsPerSecond;
        const y1 = midiToYFallback(prev.midi);
        const y2 = midiToYFallback(curr.midi);

        // Cor baseada na nota
        const noteName = midiToNoteName(Math.round(curr.midi));
        const color = getNoteColor(noteName);

        // Gradiente de opacidade (mais recente = mais opaco)
        const age = currentTime - curr.time;
        const opacity = Math.max(0.2, 1 - age / windowSize);

        ctx.strokeStyle = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // Indicador atual do usuário
    const actualFrequency = userFrequency || (userNote ? noteToMidi(userNote) * 8.18 : null);
    if (actualFrequency && actualFrequency > 50 && isRecording) {
      const userMidi = userFrequency ? frequencyToMidi(userFrequency) : noteToMidi(userNote || 'C4');
      const userY = midiToYFallback(userMidi);
      const noteName = midiToNoteName(Math.round(userMidi));
      const indicatorColor = getNoteColor(noteName);

      ctx.shadowColor = indicatorColor;
      ctx.shadowBlur = 20;

      ctx.fillStyle = indicatorColor;
      ctx.beginPath();
      ctx.arc(nowLineX, userY, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Mostra nome da nota
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(noteName, nowLineX, userY + 4);

      ctx.shadowBlur = 0;
    }

    // Labels das notas (à direita)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';

    for (let midi = Math.ceil(fMinMidi / 12) * 12; midi <= fMaxMidi; midi += 12) {
      const y = midiToYFallback(midi);
      ctx.fillText(midiToNoteName(midi), width - 4, y + 4);
    }

  }, [melodyMap, loading, currentTime, userNote, userFrequency, isRecording, height, fallbackMidiRange]);

  // Renderizar barra estilo SingStar (quando TEM melodia de referência)
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

    // Função auxiliar: tempo -> posição X (usa tempo ajustado)
    const timeToX = (time: number): number => {
      const pixelsPerSecond = (width - nowLineX) / windowSize;
      return nowLineX + (time - adjustedTime) * pixelsPerSecond;
    };

    // Encontrar notas visíveis (usa tempo ajustado)
    const startTime = adjustedTime - 1;
    const endTime = adjustedTime + windowSize;
    const visibleNotes = melodyMap.notes.filter((n: MelodyNote) => {
      const noteEnd = n.time + n.duration;
      return noteEnd >= startTime && n.time <= endTime;
    });

    // Linhas de grade horizontais (notas) - usa range dinâmico
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let midi = minMidi; midi <= maxMidi; midi += 2) {
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
      // Altura fixa para evitar oscilação visual quando o range muda
      const noteHeight = 16;

      // Verifica se a nota está no "agora" (sendo cantada) - usa tempo ajustado
      const isActive = adjustedTime >= note.time && adjustedTime <= note.time + note.duration;

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

      // Verifica se o usuário está afinado com alguma nota ativa (usa tempo ajustado)
      const activeNote = visibleNotes.find(
        (note: MelodyNote) => adjustedTime >= note.time && adjustedTime <= note.time + note.duration
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

    // Labels das notas (à esquerda) - usa range dinâmico
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';

    // Gera labels baseados no range real
    const labelMidis: number[] = [];
    for (let midi = Math.ceil(minMidi / 12) * 12; midi <= maxMidi; midi += 12) {
      if (midi >= minMidi && midi <= maxMidi) {
        labelMidis.push(midi);
      }
    }
    // Adiciona notas intermediárias se o range for pequeno
    if (labelMidis.length < 3 && midiRange <= 24) {
      for (let midi = Math.ceil(minMidi / 6) * 6; midi <= maxMidi; midi += 6) {
        if (!labelMidis.includes(midi) && midi >= minMidi && midi <= maxMidi) {
          labelMidis.push(midi);
        }
      }
      labelMidis.sort((a, b) => a - b);
    }

    for (const midi of labelMidis) {
      const y = midiToY(midi, canvasHeight);
      ctx.fillText(midiToNoteName(midi), 4, y + 4);
    }
  }, [melodyMap, adjustedTime, userNote, userFrequency, isRecording, loading, height, midiToY, minMidi, maxMidi, midiRange]);

  if (loading) {
    return (
      <div className="w-full bg-gray-900/50 rounded-lg flex items-center justify-center" style={{ height }}>
        <span className="text-gray-400 text-sm">Carregando melodia...</span>
      </div>
    );
  }

  // Modo visualizador de pitch (sem melodia de referência)
  const isFallbackMode = !melodyMap && !loading;

  // Renderização do modo fallback (visualizador de pitch)
  if (isFallbackMode) {
    return (
      <div className="w-full select-none">
        <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="opacity-70">Visualizador de tom</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full"></div>
              <span>Sua voz</span>
            </div>
          </div>
        </div>
        <div
          ref={containerRef}
          className="relative w-full rounded-lg overflow-hidden border border-white/20 bg-black/30"
          style={{ height }}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
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

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="opacity-70">Siga a melodia</span>
          {/* Controle de sync offset */}
          {onSyncOffsetChange && (
            <span className="ml-2 flex items-center gap-1">
              <button
                onClick={() => adjustOffset(-0.5)}
                className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[10px]"
                title="Adiantar melodia 0.5s"
              >
                ◀
              </button>
              <span className="text-[10px] min-w-[60px] text-center">
                Sync: {syncOffset >= 0 ? '+' : ''}{syncOffset.toFixed(1)}s
              </span>
              <button
                onClick={() => adjustOffset(0.5)}
                className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[10px]"
                title="Atrasar melodia 0.5s"
              >
                ▶
              </button>
              <button
                onClick={handleSaveOffset}
                disabled={isSaving}
                className={`ml-1 px-2 py-0.5 rounded text-[10px] transition-colors ${
                  isSaving
                    ? 'bg-gray-500/50 cursor-not-allowed'
                    : 'bg-green-600/70 hover:bg-green-500/80'
                }`}
                title="Salvar offset de sincronização"
              >
                {isSaving ? '...' : 'Salvar'}
              </button>
              {saveMessage && (
                <span className={`ml-1 text-[10px] ${
                  saveMessage.includes('✓') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {saveMessage}
                </span>
              )}
            </span>
          )}
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
        className="relative w-full rounded-lg overflow-hidden border border-white/20 bg-black/30"
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
