import { useState } from 'react';
import { initialBoard, Board, Player, moves } from '../utils/gameLogic';

export const useGonuGame = () => {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('player1');
  const [selected, setSelected] = useState<string | null>(null);

  const selectPosition = (pos: string) => {
    if (board[pos] === currentPlayer) {
      setSelected(pos);
    } else if (selected && board[pos] === null && moves[selected].includes(pos)) {
      movePiece(selected, pos);
    }
  };

  const movePiece = (from: string, to: string) => {
    setBoard((prev) => ({
      ...prev,
      [from]: null,
      [to]: currentPlayer,
    }));
    setSelected(null);
    switchPlayer();
  };

  const switchPlayer = () => {
    setCurrentPlayer((prev) => (prev === 'player1' ? 'player2' : 'player1'));
  };

  const checkWinner = (): Player => {
    const playerPieces = (player: Player) =>
      Object.values(board).filter((p) => p === player).length;

    if (playerPieces('player1') === 0) return 'player2';
    if (playerPieces('player2') === 0) return 'player1';

    return null;
  };

  return {
    board,
    currentPlayer,
    selected,
    selectPosition,
    winner: checkWinner(),
  };
};
