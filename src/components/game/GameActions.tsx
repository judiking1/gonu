import React from 'react';
import type { Game } from '../../types/game';

interface GameActionsProps {
  game: Game;
  isReady: boolean;
  onReady: () => void;
  onSurrender: () => void;
  onLeave: () => void;
}

export const GameActions: React.FC<GameActionsProps> = ({
  game,
  isReady,
  onReady,
  onSurrender,
  onLeave,
}) => {
  return (
    <div className="flex justify-center gap-4">
      {(game.status === 'waiting' || game.status === 'finished') && (
        <button
          className={`px-4 py-2 rounded ${
            isReady ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white`}
          onClick={onReady}
        >
          {isReady ? '준비 취소' : '준비하기'}
        </button>
      )}
      {game.status === 'playing' && (
        <button
          className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
          onClick={onSurrender}
        >
          기권하기
        </button>
      )}
      {(game.status === 'waiting' || game.status === 'finished') && (
        <button
          className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
          onClick={onLeave}
        >
          나가기
        </button>
      )}
    </div>
  );
}; 