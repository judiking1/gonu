import { useParams } from 'react-router-dom';

export default function GamePage() {
  const { gameId } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">게임 ID: {gameId}</h1>
    </div>
  );
}
