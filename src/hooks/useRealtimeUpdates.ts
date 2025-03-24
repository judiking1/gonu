import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import type { Game, GameState } from '../types/game';

interface UseRealtimeUpdatesProps {
  gameId: string | undefined;
  user: { id: string } | null;
  setGame: (game: Game) => void;
  setGameState: (gameState: GameState) => void;
  setIsReady: (isReady: boolean) => void;
  cancelCountdown: () => void;
}

export const useRealtimeUpdates = ({
  gameId,
  user,
  setGame,
  setGameState,
  setIsReady,
  cancelCountdown
}: UseRealtimeUpdatesProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId || !user) return;

    const channel = supabase
      .channel(`game_${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        console.log('게임 업데이트 수신:', payload);
        if (payload.eventType === 'DELETE') {
          alert('게임방이 삭제되었습니다.');
          navigate('/lobby');
          return;
        }
        
        supabase
          .from('games')
          .select(`
            *,
            game_maps (*),
            player1:profiles!games_player1_id_fkey (
              username
            ),
            player2:profiles!games_player2_id_fkey (
              username
            )
          `)
          .eq('id', gameId)
          .single()
          .then(({ data: updatedGameData, error }) => {
            if (error) {
              console.error('게임 데이터 업데이트 에러:', error);
              return;
            }
            if (!updatedGameData.player1_id || (user.id === updatedGameData.player2_id && !updatedGameData.player1_id)) {
              alert('방장이 나갔습니다. 로비로 이동합니다.');
              navigate('/lobby');
              return;
            }

            if (updatedGameData.status === 'playing' || updatedGameData.status === 'finished') {
              cancelCountdown();
            }

            setGame(updatedGameData);
            const gameStateData = updatedGameData.game_state as GameState;
            setGameState(gameStateData);
            setIsReady(
              updatedGameData.player1_id === user.id 
                ? updatedGameData.player1_ready 
                : updatedGameData.player2_ready
            );
          });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [gameId, user]);
}; 