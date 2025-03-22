import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

interface Game {
  id: string;
  player1_id: string;
  player2_id: string;
  winner_id: string | null;
  game_type: string;
  moves: any[];
  started_at: string;
  ended_at: string | null;
}

export const useGameRoom = (gameId: string) => {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    // 초기 게임 데이터 로드
    supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()
      .then(({ data }) => setGame(data));

    // Realtime 구독
    const channel = supabase
      .channel(`game-room-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGame(payload.new as Game);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return { game };
};
