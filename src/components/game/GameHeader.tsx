import React from 'react';
import type { Game } from '../../types/game';

interface GameHeaderProps {
  game: Game;
  user: { id: string } | null;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ game, user }) => {
  const statusMap = {
    waiting: '⏳ 대기중',
    playing: '🚩 게임중',
    finished: game.winner_id === user?.id ? '🎉 승리!' : '😢 패배...',
  };
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-4">{game.title}</h1>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-lg">방장: {game.player1?.username}</p>
          <p className="text-lg">참가자: {game.player2?.username || '대기중'}</p>
        </div>
        <div className="font-semibold text-indigo-600">{statusMap[game.status]}</div>
      </div>
    </div>
  );
}; 