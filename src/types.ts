export interface CountryPuzzleConfig {
  id: string;
  name: string;
  title: string;
  nativeTitle?: string;
  emoji: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  totalPieces: number;
  center: [number, number];
  zoom: number;
  bounds: {
    latMin: number;
    latMax: number;
    lngLeft: [number, number];
    lngRight: [number, number];
  };
  files: string[];
  status: 'available' | 'in_development';
  tags: string[];
}

export interface PuzzlePiece {
  id: string;
  name: string;
  isSnapped: boolean;
  targetCenter: { lat: number; lng: number };
  currentCenter: { lat: number; lng: number };
  featureData?: any;
}

export interface GameStats {
  gamesPlayed: number;
  gamesCompleted: number;
  totalTimeElapsed: number; // in seconds
  bestTime: number | null; // in seconds
  totalShuffles: number;
  history: GameHistoryItem[];
}

export interface GameHistoryItem {
  id: string;
  puzzleId: string;
  puzzleName: string;
  date: string;
  timeElapsed: number;
  shuffles: number;
  completed: boolean;
  score: number;
  totalPieces: number;
}

export type ActivePage = 'home' | 'puzzles' | 'game' | 'analytics' | 'about' | 'domain';
