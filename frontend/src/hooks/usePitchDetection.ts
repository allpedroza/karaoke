import { useState, useRef, useCallback, useEffect } from 'react';

interface PitchData {
  frequency: number;  // Hz
  note: string;       // ex: "A4", "C#5"
  cents: number;      // desvio em cents (-50 a +50)
  confidence: number; // 0 a 1
  timestamp: number;
  rms: number;        // volume RMS
}

interface PitchStats {
  averageFrequency: number;
  pitchStability: number;    // 0-100: quão estável foi o tom
  notesDetected: string[];   // notas únicas detectadas
  pitchAccuracy: number;     // 0-100: precisão geral do tom
  totalSamples: number;
  validSamples: number;      // amostras com voz detectada
  pitchHistory: PitchData[]; // histórico completo
  chorusDetected: boolean;   // se foi detectado coro/múltiplas vozes
  peakVolumeMoments: number; // momentos de pico de volume (indicativo de coro)
}

interface UsePitchDetectionReturn {
  isAnalyzing: boolean;
  currentPitch: PitchData | null;
  pitchStats: PitchStats | null;
  startAnalysis: (stream: MediaStream) => void;
  stopAnalysis: () => void;
  resetAnalysis: () => void;
}

// Frequências das notas musicais (A4 = 440Hz)
const NOTE_FREQUENCIES: { [key: string]: number } = {
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50,
};

// Converter frequência para nota mais próxima
function frequencyToNote(frequency: number): { note: string; cents: number } {
  if (frequency < 60 || frequency > 1100) {
    return { note: '', cents: 0 };
  }

  let closestNote = '';
  let minDiff = Infinity;
  let closestFreq = 0;

  for (const [note, freq] of Object.entries(NOTE_FREQUENCIES)) {
    const diff = Math.abs(frequency - freq);
    if (diff < minDiff) {
      minDiff = diff;
      closestNote = note;
      closestFreq = freq;
    }
  }

  // Calcular cents (100 cents = 1 semitom)
  const cents = Math.round(1200 * Math.log2(frequency / closestFreq));

  return { note: closestNote, cents };
}

// Algoritmo de autocorrelação para detecção de pitch
function autoCorrelate(buffer: Float32Array, sampleRate: number): { frequency: number; confidence: number; rms: number } {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  // Calcular RMS para verificar se há sinal suficiente
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / SIZE);

  // Se o sinal é muito fraco, não detectar pitch
  if (rms < 0.01) {
    return { frequency: -1, confidence: 0, rms };
  }

  let lastCorrelation = 1;
  for (let offset = 0; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;

    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }

    correlation = 1 - correlation / MAX_SAMPLES;

    // Encontrar o primeiro pico após a queda inicial
    if (correlation > 0.9 && correlation > lastCorrelation) {
      if (bestCorrelation < correlation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }
    lastCorrelation = correlation;
  }

  if (bestOffset === -1 || bestCorrelation < 0.9) {
    return { frequency: -1, confidence: bestCorrelation, rms };
  }

  const frequency = sampleRate / bestOffset;
  return { frequency, confidence: bestCorrelation, rms };
}

export function usePitchDetection(): UsePitchDetectionReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<PitchData | null>(null);
  const [pitchStats, setPitchStats] = useState<PitchStats | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pitchHistoryRef = useRef<PitchData[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const calculateStats = useCallback((): PitchStats => {
    const history = pitchHistoryRef.current;
    const validPitches = history.filter((p: PitchData) => p.confidence > 0.8 && p.frequency > 0);

    if (validPitches.length === 0) {
      return {
        averageFrequency: 0,
        pitchStability: 0,
        notesDetected: [],
        pitchAccuracy: 0,
        totalSamples: history.length,
        validSamples: 0,
        pitchHistory: history,
        chorusDetected: false,
        peakVolumeMoments: 0,
      };
    }

    // Média de frequência
    const avgFreq = validPitches.reduce((sum: number, p: PitchData) => sum + p.frequency, 0) / validPitches.length;

    // Estabilidade (baseada no desvio padrão)
    const variance = validPitches.reduce((sum: number, p: PitchData) => sum + Math.pow(p.frequency - avgFreq, 2), 0) / validPitches.length;
    const stdDev = Math.sqrt(variance);
    const stability = Math.max(0, 100 - (stdDev / avgFreq) * 100);

    // Notas únicas detectadas
    const uniqueNotes: string[] = [...new Set(validPitches.map((p: PitchData) => p.note).filter((n: string) => n))];

    // Precisão (baseada em cents - quão perto das notas corretas)
    const avgCentsOff = validPitches.reduce((sum: number, p: PitchData) => sum + Math.abs(p.cents), 0) / validPitches.length;
    const accuracy = Math.max(0, 100 - avgCentsOff * 2); // 50 cents = 0% accuracy

    // Detectar momentos de coro/múltiplas vozes
    // Baseado em picos de volume significativamente acima da média
    const rmsValues = history.map((p: PitchData) => p.rms || 0).filter((r: number) => r > 0);
    const avgRms = rmsValues.length > 0
      ? rmsValues.reduce((sum: number, r: number) => sum + r, 0) / rmsValues.length
      : 0;
    const rmsThreshold = avgRms * 1.8; // 80% acima da média indica possível coro

    // Contar momentos de pico (possível coro)
    let peakMoments = 0;
    let inPeak = false;
    for (const p of history) {
      if ((p.rms || 0) > rmsThreshold) {
        if (!inPeak) {
          peakMoments++;
          inPeak = true;
        }
      } else {
        inPeak = false;
      }
    }

    // Coro detectado se houver múltiplos momentos de pico e boa presença vocal
    const voicePresence = validPitches.length / Math.max(1, history.length);
    const chorusDetected = peakMoments >= 3 && voicePresence > 0.4;

    return {
      averageFrequency: Math.round(avgFreq),
      pitchStability: Math.round(stability),
      notesDetected: uniqueNotes,
      pitchAccuracy: Math.round(accuracy),
      totalSamples: history.length,
      validSamples: validPitches.length,
      pitchHistory: history,
      chorusDetected,
      peakVolumeMoments: peakMoments,
    };
  }, []);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.fftSize;
    const buffer = new Float32Array(bufferLength);

    analyser.getFloatTimeDomainData(buffer);

    const { frequency, confidence, rms } = autoCorrelate(buffer, audioContextRef.current.sampleRate);

    if (frequency > 0 && confidence > 0.8) {
      const { note, cents } = frequencyToNote(frequency);
      const pitchData: PitchData = {
        frequency: Math.round(frequency),
        note,
        cents,
        confidence,
        timestamp: Date.now(),
        rms,
      };

      setCurrentPitch(pitchData);
      pitchHistoryRef.current.push(pitchData);
    } else {
      // Registrar silêncio/ruído
      pitchHistoryRef.current.push({
        frequency: 0,
        note: '',
        cents: 0,
        confidence,
        timestamp: Date.now(),
        rms,
      });
    }

    animationFrameRef.current = requestAnimationFrame(analyze);
  }, []);

  const startAnalysis = useCallback((stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      pitchHistoryRef.current = [];
      setIsAnalyzing(true);
      setPitchStats(null);

      analyze();
    } catch (err) {
      console.error('Error starting pitch analysis:', err);
    }
  }, [analyze]);

  const stopAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Calcular estatísticas finais
    const stats = calculateStats();
    setPitchStats(stats);

    setIsAnalyzing(false);
    setCurrentPitch(null);

    // Desconectar áudio
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [calculateStats]);

  const resetAnalysis = useCallback(() => {
    pitchHistoryRef.current = [];
    setCurrentPitch(null);
    setPitchStats(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isAnalyzing,
    currentPitch,
    pitchStats,
    startAnalysis,
    stopAnalysis,
    resetAnalysis,
  };
}
