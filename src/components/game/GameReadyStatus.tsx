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
        <div className="text-center">
          <p className="text-lg mb-2">
            {isReady ? '준비완료' : '준비해주세요'}
          </p>
          {game.player1_ready && game.player2_ready && countdown !== null && (
            <p className="text-xl font-bold">
              {countdown}초 후 게임이 시작됩니다
            </p>
          )}
        </div>
      )}
      <div className="flex justify-center gap-4 mb-4">
        <div className="text-center">
          <p>방장</p>
          <p>{game.player1_ready ? '준비완료' : '대기중'}</p>
        </div>
        {game.player2_id && (
          <div className="text-center">
            <p>참가자</p>
            <p>{game.player2_ready ? '준비완료' : '대기중'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
