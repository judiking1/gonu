import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { Game } from '../types/game';

export const useCountdown = (game: Game | null) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownTimer, setCountdownTimer] = useState<NodeJS.Timeout | null>(null);

  const cancelCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      setCountdownTimer(null);
    }
    setCountdown(null);
  };

  const startGame = async () => {
    if (!game) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({
          status: 'playing',
          player1_ready: false,
          player2_ready: false,
          winner_id: null,
          countdown_start: null,
          // 흑이 먼저 두도록
          current_turn: game.player1_id,
        })
        .eq('id', game.id);

      if (error) throw error;
    } catch (error) {
      console.error('게임 시작 실패:', error);
    }
  };

  const startCountdown = () => {
    if (!game || !game.countdown_start) return;

    cancelCountdown();

    const startTime = new Date(game.countdown_start).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = 3 - elapsed;

    if (remaining <= 0) {
      startGame();
      return;
    }

    setCountdown(remaining);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = 3 - elapsed;

      if (remaining <= 0) {
        clearInterval(timer);
        startGame();
        setCountdown(null);
      } else {
        setCountdown(remaining);
      }
    }, 500);

    setCountdownTimer(timer);
  };

  useEffect(() => {
    if (game?.countdown_start && game.status === 'waiting' && !countdownTimer) {
      startCountdown();
    } else if (!game?.countdown_start) {
      cancelCountdown();
    }
  }, [game?.countdown_start, game?.status]);

  useEffect(() => {
    return () => {
      cancelCountdown();
    };
  }, []);

  return {
    countdown,
    cancelCountdown
  };
}; 