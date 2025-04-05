import { useParams, useNavigate } from 'react-router-dom';
import { useGameState } from '../../hooks/useGameState';
import { useGameActions } from '../../hooks/useGameActions';
import { useCountdown } from '../../hooks/useCountdown';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { GameHeader } from '../../components/game/GameHeader';
import { GameReadyStatus } from '../../components/game/GameReadyStatus';
import { GameBoard } from '../../components/game/GameBoard';
import { GameActions } from '../../components/game/GameActions';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import GameChat from '../../components/chat/GameChat';

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>(); // 여기가 핵심!
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!gameId) {
      navigate('/lobby');
      return;
    }
  }, [gameId, navigate]);

  const { game, isReady, setGame, setGameState, setIsReady, loading } =
    useGameState(gameId);
  const { handleReady, handleSurrender, leaveGame, handlePlaceStone,handleMoveStone } =
    useGameActions({
      game,
      user,
      isReady,
      setIsReady,
    });

  const { countdown, cancelCountdown } = useCountdown(game);

  useRealtimeUpdates({
    gameId,
    user,
    setGame,
    setGameState,
    setIsReady,
    cancelCountdown,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600 mb-4">게임을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/lobby')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          로비로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
        <GameHeader game={game} user={user} />
        <GameReadyStatus game={game} isReady={isReady} countdown={countdown} />
        <GameBoard game={game} user={user}  onPlaceStone={handlePlaceStone} onMoveStone={handleMoveStone}  />
        <GameActions
          game={game}
          isReady={isReady}
          onReady={handleReady}
          onSurrender={handleSurrender}
          onLeave={leaveGame}
        />
      </div>
      <div className="lg:w-96 w-full bg-white rounded-lg shadow-lg p-4">
        <GameChat gameId={game.id} />
      </div>
    </div>
  );
};

export default Game;
