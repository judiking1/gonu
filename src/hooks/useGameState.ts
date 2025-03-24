import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '../stores/authStore';
import type { Game, GameState } from '../types/game';

export const useGameState = (gameId: string | undefined) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isReady, setIsReady] = useState(false);

  const loadGame = async () => {
    if (!gameId) {
      console.log('No game ID provided');
      setLoading(false);
      return;
    }

    if (!user) {
      console.error('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      console.log('Loading game data for ID:', gameId);
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          game_maps (*),
          player1:profiles!games_player1_id_fkey (
            id,
            username,
            avatar_url
          ),
          player2:profiles!games_player2_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('게임 데이터 로딩 에러:', gameError);
        navigate('/lobby');
        return;
      }
      
      if (!gameData) {
        console.error('게임 데이터가 없습니다.');
        navigate('/lobby');
        return;
      }

      console.log('Loaded game data:', gameData);

      // 게임 참여자 확인
      const isPlayer1 = gameData.player1_id === user.id;
      const isPlayer2 = gameData.player2_id === user.id;
      const canJoin = gameData.status === 'waiting' && !gameData.player2_id;
      
      if (!isPlayer1 && !isPlayer2 && !canJoin) {
        console.error('이 게임에 참여할 수 없습니다.');
        navigate('/lobby');
        return;
      }

      setGame(gameData);
      setIsReady(isPlayer1 ? gameData.player1_ready : gameData.player2_ready);
    } catch (error) {
      console.error('게임 상태 로딩 에러:', error);
      navigate('/lobby');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGame();
  }, [gameId, user]);

  return {
    game,
    setGame,
    gameState,
    setGameState,
    loading,
    isReady,
    setIsReady,
    user
  };
}; 