import { useGonuGame } from '../../hooks/useGonuGame';

export default function GonuBoard() {
  const { board, selected, selectPosition, currentPlayer, winner } = useGonuGame();

  const renderCell = (pos: string) => {
    const player = board[pos];
    const isSelected = selected === pos;
    return (
      <div
        key={pos}
        className={`w-16 h-16 border flex items-center justify-center cursor-pointer ${
          isSelected ? 'bg-yellow-200' : 'bg-gray-100'
        }`}
        onClick={() => selectPosition(pos)}
      >
        {player === 'player1' && <span className="text-red-500 font-bold">●</span>}
        {player === 'player2' && <span className="text-blue-500 font-bold">●</span>}
      </div>
    );
  };

  return (
    <div>
      <h2 className="mb-2 font-bold">
        {winner ? `🎉 승자: ${winner}` : `현재 플레이어: ${currentPlayer}`}
      </h2>
      <div className="grid grid-cols-3 gap-1 w-max">
        {['0,0', '0,1', '0,2', '1,0', '1,1', '1,2', '2,0', '2,1', '2,2'].map(renderCell)}
      </div>
    </div>
  );
}
