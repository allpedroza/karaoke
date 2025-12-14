export interface KaraokeVideo {
  id: string;
  code: string;
  title: string;
  thumbnail: string;
  artist: string;
  song: string;
  language: 'pt-BR' | 'en' | 'es';
  genre: string;
  duration: string;
}

export interface PitchStats {
  averageFrequency: number;
  pitchStability: number;
  notesDetected: string[];
  pitchAccuracy: number;
  totalSamples: number;
  validSamples: number;
}

export interface PerformanceData {
  transcription: string;
  pitchStats: PitchStats | null;
}

export interface DimensionScore {
  score: number;
  detail: string;
}

export interface PerformanceEvaluation {
  overallScore: number;
  dimensions: {
    pitch: DimensionScore;   // Tom
    lyrics: DimensionScore;  // Letra
    energy: DimensionScore;  // Animação
  };
  encouragement: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  transcription: string;
}

export interface AppState {
  currentView: 'home' | 'karaoke' | 'results';
  selectedVideo: KaraokeVideo | null;
  evaluation: PerformanceEvaluation | null;
  isLoading: boolean;
  error: string | null;
}
