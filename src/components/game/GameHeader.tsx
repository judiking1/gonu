import React from 'react';
import type { Game } from '../../types/game';

interface GameHeaderProps {
  game: Game;
  user: { id: string } | null;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ game, user }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-4">{game.title}</h1>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-lg">방장: {game.player1?.username}</p>
          <p className="text-lg">참가자: {game.player2?.username || '대기중'}</p>
        </div>
        <div>
          <p className="text-lg">
            상태: {
              game.status === 'waiting' 
                ? '대기중' 
                : game.status === 'playing' 
                  ? '게임중' 
                  : game.status === 'finished'
                    ? game.winner_id === user?.id
                      ? '승리!'
                      : '패배...'
                    : '종료'
            }
          </p>
        </div>
      </div>
    </div>
  );
}; 