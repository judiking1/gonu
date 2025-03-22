import { useParams } from 'react-router-dom';
import { useGameRoom } from '../hooks/useGameRoom';

export default function GamePage() {
  const { gameId } = useParams();
  const { game } = useGameRoom(gameId!);

  if (!game) return <div className="p-4">로딩 중...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">고누 게임방</h1>
      <p>게임 ID: {game.id}</p>
      <p>플레이어1: {game.player1_id}</p>
      <p>플레이어2: {game.player2_id}</p>
      <p>게임 종류: {game.game_type}</p>
      <p>시작 시간: {new Date(game.started_at).toLocaleString()}</p>
      <p>종료 여부: {game.ended_at ? '종료' : '진행 중'}</p>
    </div>
  );
}
