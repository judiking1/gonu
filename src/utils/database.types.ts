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
          created_at: string
          player1_id: string
          player2_id: string | null
          status: 'waiting' | 'playing' | 'finished'
          game_state: Json
          map_id: string
          title: string
          player1_ready: boolean
          player2_ready: boolean
          winner_id: string | null
          player1: { username: string } | null
          player2: { username: string } | null
          countdown_start: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          player1_id: string
          player2_id?: string | null
          status?: 'waiting' | 'playing' | 'finished'
          game_state: Json
          map_id: string
          title: string
          player1_ready?: boolean
          player2_ready?: boolean
          winner_id?: string | null
          countdown_start?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          player1_id?: string
          player2_id?: string | null
          status?: 'waiting' | 'playing' | 'finished'
          game_state?: Json
          map_id?: string
          title?: string
          player1_ready?: boolean
          player2_ready?: boolean
          winner_id?: string | null
          countdown_start?: string | null
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