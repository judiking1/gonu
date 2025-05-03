import type { Database } from '../utils/database.types';

export interface Game {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  status: 'waiting' | 'playing' | 'finished';
  player1?: {
    username: string;
    is_ready: boolean;
  } | null;
  player2?: {
    username: string;
    is_ready: boolean;
  } | null;
  player1_id: string | null;
  player2_id: string | null;
  player1_ready: boolean;
  player2_ready: boolean;
  winner_id: string | null;
  countdown_start: string | null;
  current_turn: string | null;
  player1_periods: number;
  player2_periods: number;
  player1_time_left: number;
  player2_time_left: number;
  game_state: {
    occupant: { [key: string]: number };
    currentPlayer: string | null;
    phase: 'placement'|'movement';
    blackCount: number;
    whiteCount: number;
  };
  game_maps: GameMap;
}

export type GameMap = Database['public']['Tables']['game_maps']['Row'];

export interface GameRules {
  board_size: number;
  win_condition: string;
  move_rules: {
    diagonal: boolean;
    horizontal: boolean;
    vertical: boolean;
  };
}

export interface GameState {
  isLoading: boolean;
  error: Error | null;
  game: Game | null;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';