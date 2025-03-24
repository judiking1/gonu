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
  const { handleReady, handleSurrender, leaveGame, handlePlaceStone } =
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
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">게임을 찾을 수 없습니다.</p>
        <button
          onClick={() => navigate('/lobby')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          로비로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-row gap-4 p-4'>
      <div className="container mx-auto px-4 py-8">
        <GameHeader game={game} user={user} />
        <GameReadyStatus game={game} isReady={isReady} countdown={countdown} />
        <GameBoard game={game} user={user} onPlaceStone={handlePlaceStone} />
        <GameActions
          game={game}
          isReady={isReady}
          onReady={handleReady}
          onSurrender={handleSurrender}
          onLeave={leaveGame}
        />
      </div>
        <div className="w-100">
          <GameChat gameId={game.id} />
        </div>
    </div>
  );
};

export default Game;
