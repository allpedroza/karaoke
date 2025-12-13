export interface KaraokeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  artist: string;
  song: string;
}

export interface PerformanceEvaluation {
  overallScore: number;
  categories: {
    lyrics: CategoryScore;
    timing: CategoryScore;
    expression: CategoryScore;
  };
  feedback: string;
  highlights: string[];
  improvements: string[];
  encouragement: string;
}

export interface CategoryScore {
  score: number;
  maxScore: number;
  feedback: string;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  transcription: string;
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  videoId: string | null;
}

export interface AppState {
  currentView: 'home' | 'karaoke' | 'results';
  selectedVideo: KaraokeVideo | null;
  evaluation: PerformanceEvaluation | null;
  isLoading: boolean;
  error: string | null;
}
