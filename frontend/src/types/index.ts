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
  currentView: 'landing' | 'pricing' | 'auth' | 'home' | 'karaoke' | 'results' | 'user-dashboard' | 'admin-dashboard';
  selectedVideo: KaraokeVideo | null;
  evaluation: PerformanceEvaluation | null;
  isLoading: boolean;
  error: string | null;
}

// Tipos para autenticação e usuários
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  credits: number;
  plan: 'free' | 'personal' | 'custom';
  planCredits: number;
  createdAt: string;
}

export interface PricingPlan {
  id: 'free' | 'personal' | 'custom';
  name: string;
  price: number | null;
  credits: number | null;
  features: string[];
  highlighted?: boolean;
}

export interface Purchase {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: 'free' | 'personal' | 'custom';
  amount: number;
  credits: number;
  status: 'pending' | 'completed' | 'refunded';
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'bonus' | 'admin_grant';
  amount: number;
  description: string;
  createdAt: string;
}

// Item da fila de músicas (música + cantor)
export interface QueueItem {
  video: KaraokeVideo;
  singerName: string;
}
