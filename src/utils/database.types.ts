export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      game_maps: {
        Row: {
          id: string
          name: string
          description: string
          board_size: number
          rules: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          board_size: number
          rules: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          board_size?: number
          rules?: Json
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          map_id: string
          player1_id: string
          player2_id: string | null
          current_turn: string | null
          game_state: Json
          status: 'waiting' | 'playing' | 'finished'
          winner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          map_id: string
          player1_id: string
          player2_id?: string | null
          current_turn?: string | null
          game_state: Json
          status?: 'waiting' | 'playing' | 'finished'
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          map_id?: string
          player1_id?: string
          player2_id?: string | null
          current_turn?: string | null
          game_state?: Json
          status?: 'waiting' | 'playing' | 'finished'
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          game_id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          message?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 