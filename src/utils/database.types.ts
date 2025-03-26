export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
type Node = {
  x: number;
  y: number;
  id: string;
}
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
          rules: Json
          created_at: string
          map_data: {
            edges: [string, string][]; // 각 요소가 [nodeId1, nodeId2] 형태의 튜플인 배열
            nodes: Node[]; // x, y 좌표와 id를 가진 객체들의 배열
            forbidden_moves: {
              to: string;
              from: string;
              piece: 'black' | 'white'; // 또는 string (만약 다른 piece 종류가 있을 수 있다면)
              description: string;
            }[]; // 금지된 움직임 정보를 담는 객체들의 배열
            initial_positions: {
              black: Node[]; // 흑돌의 초기 위치 (node id 배열)
              white: Node[]; // 백돌의 초기 위치 (node id 배열)
            };
          }
        }
        Insert: {
          id?: string
          name: string
          description: string
          rules: Json
          created_at?: string
          map_data: Json
        }
        Update: {
          id?: string
          name?: string
          description?: string
          rules?: Json
          created_at?: string
          map_data: Json
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