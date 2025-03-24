import React from 'react';
import type { Game } from '../../types/game';

interface GameReadyStatusProps {
  game: Game;
  isReady: boolean;
  countdown: number | null;
}

export const GameReadyStatus: React.FC<GameReadyStatusProps> = ({ game, isReady, countdown }) => {
  return (
    <div className="mb-4">
        {(game.status === 'waiting' || game.status === 'finished') && (
        <div className="mb-3">
          <p className={`text-xl font-semibold ${isReady ? 'text-green-500' : 'text-red-500'}`}>
            {isReady ? '✅ 준비 완료' : '❗ 준비해주세요'}
          </p>
          {game.player1_ready && game.player2_ready && countdown !== null && (
            <p className="text-xl font-bold text-indigo-600 mt-2">
              {countdown}초 후 게임이 시작됩니다 🚀
            </p>
          )}
        </div>
      )}
       <div className="flex justify-around">
        <div>
          <p className="font-medium">방장 👑</p>
          <p className={`font-semibold ${game.player1_ready ? 'text-green-500' : 'text-gray-400'}`}>
            {game.player1_ready ? '준비 완료' : '대기중'}
          </p>
        </div>
        {game.player2_id && (
          <div>
            <p className="font-medium">참가자 🎮</p>
            <p className={`font-semibold ${game.player2_ready ? 'text-green-500' : 'text-gray-400'}`}>
              {game.player2_ready ? '준비 완료' : '대기중'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
