export interface KaraokeVideo {
  id: string;
  code: string;
  title: string;
  thumbnail: string;
  artist: string;
  song: string;
  language: 'pt-BR' | 'en' | 'es';
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
