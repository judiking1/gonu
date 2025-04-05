// src/hooks/useGameActions.ts
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import type { Game } from '../types/game';
import { UmulLogic } from '../gameLogic/umul';
import { SabangLogic } from '../gameLogic/sabang';

interface UseGameActionsProps {
  game: Game | null;
  user: { id: string } | null;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
}

export const useGameActions = ({
  game,
  user,
  isReady,
  setIsReady,
}: UseGameActionsProps) => {
  const navigate = useNavigate();

  async function resetGameStateForRematch() {
    if (!game) return;

    // game_maps 데이터를 포함한 임시 Game 객체 생성
    const tempGame = {
      ...game,
      game_maps: game.game_maps,
    };

    // 맵 이름에 따라 초기 game_state 설정
    const initialGameState =
      game.game_maps!.name === '우물고누'
        ? UmulLogic.initializeGameState(tempGame as any)
        : SabangLogic.initializeGameState(tempGame as any);

    const { error } = await supabase
      .from('games')
      .update({
        winner_id: null,
        status: 'waiting',
        current_turn: game.player1_id,
        countdown_start: null,
        game_state: initialGameState,
      })
      .eq('id', game.id);

    if (error) console.error('게임 리셋 실패:', error);
  }

  const handleReady = async () => {
    if (!game || !user) return;
    if (game.status === 'finished') {
      await resetGameStateForRematch();
    }

    const isPlayer1 = game.player1_id === user.id;
    const updateData = isPlayer1
      ? { player1_ready: !isReady }
      : { player2_ready: !isReady };

    try {
      if (isReady) {
        const { error } = await supabase
          .from('games')
          .update({
            ...updateData,
            status: 'waiting',
            countdown_start: null,
          })
          .eq('id', game.id);
        if (error) throw error;
      } else {
        const { error: updateError } = await supabase
          .from('games')
          .update({
            ...updateData,
            status: 'waiting',
            winner_id: null,
          })
          .eq('id', game.id);
        if (updateError) throw updateError;

        const { data: currentGame, error: checkError } = await supabase
          .from('games')
          .select('*')
          .eq('id', game.id)
          .single();
        if (checkError) throw checkError;

        if (
          (isPlayer1 && currentGame.player2_ready) ||
          (!isPlayer1 && currentGame.player1_ready)
        ) {
          const { error: startError } = await supabase
            .from('games')
            .update({
              countdown_start: new Date().toISOString(),
            })
            .eq('id', game.id);
          if (startError) throw startError;
        }
      }
      setIsReady(!isReady);
    } catch (error) {
      console.error('준비 상태 변경 실패:', error);
    }
  };

  const handleSurrender = async () => {
    if (!game || !user) return;

    if (
      !window.confirm(
        '정말 기권하시겠습니까? 상대방의 승리로 게임이 종료됩니다.'
      )
    ) {
      return;
    }

    try {
      const winnerId =
        game.player1_id === user.id ? game.player2_id : game.player1_id;
      await supabase
        .from('games')
        .update({
          status: 'finished',
          winner_id: winnerId,
          player1_ready: false,
          player2_ready: false,
        })
        .eq('id', game.id);
    } catch (error) {
      console.error('기권 처리 실패:', error);
    }
  };

  const leaveGame = async () => {
    if (!game || !user) return;

    if (
      game.status === 'playing' &&
      !window.confirm(
        '게임 진행 중에 나가시면 기권 처리됩니다. 정말 나가시겠습니까?'
      )
    ) {
      return;
    }

    try {
      const isPlayer1 = game.player1_id === user.id;
      const isPlayer2 = game.player2_id === user.id;

      if (isPlayer1) {
        if (game.status === 'playing') {
          await supabase
            .from('games')
            .update({
              status: 'finished',
              winner_id: game.player2_id,
            })
            .eq('id', game.id);
        } else {
          await supabase.from('games').delete().eq('id', game.id);
        }
      } else if (isPlayer2) {
        if (game.status === 'playing') {
          await supabase
            .from('games')
            .update({
              status: 'finished',
              winner_id: game.player1_id,
            })
            .eq('id', game.id);
        } else {
          await supabase
            .from('games')
            .update({
              player2_id: null,
              player2_ready: false,
              status: 'waiting',
            })
            .eq('id', game.id);
        }
      }
      navigate('/lobby');
    } catch (error) {
      console.error('게임 나가기 실패:', error);
    }
  };

  return {
    handleReady,
    handleSurrender,
    leaveGame,
  };
};
