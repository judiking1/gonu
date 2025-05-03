import { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import type { Game } from '../types/game';
import { User } from '@supabase/supabase-js';

export const useByoYomiTimer = (game: Game | null, user: User | null) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!game || !user?.id || game.status !== 'playing') return;
  
    const isMyTurn = game.current_turn === user?.id;
    if (!isMyTurn) return;
  
    // 기존 타이머 제거
    if (timerRef.current) clearInterval(timerRef.current);
  
    // 새 타이머 등록
    timerRef.current = setInterval(async () => {
      const timeField = game.player1_id === user.id ? 'player1_time_left' : 'player2_time_left';
      const periodField = game.player1_id === user.id ? 'player1_periods' : 'player2_periods';
  
      const currentTime = game[timeField] ?? 30;
      const currentPeriods = game[periodField] ?? 3;
  
      if (currentTime > 1) {
        await supabase.from('games').update({ [timeField]: currentTime - 1 }).eq('id', game.id);
      } else if (currentPeriods > 1) {
        await supabase
          .from('games')
          .update({
            [timeField]: 30,
            [periodField]: currentPeriods - 1,
          })
          .eq('id', game.id);
      } else {
        const winnerId = game.player1_id === user.id ? game.player2_id : game.player1_id;
        await supabase
          .from('games')
          .update({
            status: 'finished',
            winner_id: winnerId,
          })
          .eq('id', game.id);
      }
    }, 1000);
  
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [game, user?.id]); // ✅ 의존성에 game 전체 포함
};
