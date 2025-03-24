import React from 'react';
import type { Game } from '../../types/game';

interface GameBoardProps {
  game: Game;
  user: { id: string } | null;
  onPlaceStone: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  user,
  onPlaceStone,
}) => {
  const isMyTurn = game.current_player_id === user?.id;
  const canPlay = game.status === 'playing' && isMyTurn;
  // 🔥여기서부터 수정됨🔥
  const board = game.game_state.board; // 안전하게 접근
  const boardSize = game.game_maps?.board_size || board.length;

  if (!board) {
    return <div>게임 데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="flex justify-center mb-8">
      <div
        className="grid gap-0 bg-yellow-100 p-4 rounded shadow-lg"
        style={{ gridTemplateColumns: `repeat(${boardSize}, 2rem)` }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-8 h-8 border border-gray-400 relative
                ${canPlay ? 'hover:bg-yellow-200' : ''}
                ${cell === 1 ? 'after:content-[""] after:absolute after:inset-1 after:bg-black after:rounded-full' : ''}
                ${cell === 2 ? 'after:content-[""] after:absolute after:inset-1 after:bg-white after:rounded-full after:border after:border-black' : ''}
              `}
              onClick={() => canPlay && onPlaceStone(rowIndex, colIndex)}
              disabled={!canPlay || cell !== 0}
            />
          ))
        )}
      </div>
    </div>
  );
};
