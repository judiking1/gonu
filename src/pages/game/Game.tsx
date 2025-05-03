import { useParams, useNavigate } from 'react-router-dom';
import { useGameState } from '../../hooks/useGameState';
import { useGameActions } from '../../hooks/useGameActions';
import { useCountdown } from '../../hooks/useCountdown';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { useGameLogic } from '../../hooks/useGameLogic';
import { GameHeader } from '../../components/game/GameHeader';
import { GameReadyStatus } from '../../components/game/GameReadyStatus';
import { GameBoard } from '../../components/game/GameBoard';
import { GameActions } from '../../components/game/GameActions';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';
import GameChat from '../../components/chat/GameChat';
import { useByoYomiTimer } from '../../hooks/useByoYomiTimer';

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!gameId) navigate('/lobby');
  }, [gameId, navigate]);

  const { game, isReady, setGame, setGameState, setIsReady, loading } = useGameState(gameId);
  const { handleReady, handleSurrender, leaveGame } = useGameActions({
    game,
    user,
    isReady,
    setIsReady,
  });
  const { countdown, cancelCountdown } = useCountdown(game);
  const { handleNodeClick, selectedNode } = useGameLogic({ game, user });

  useByoYomiTimer(game, user);

  useRealtimeUpdates({ gameId, user, setGame, setGameState, setIsReady, cancelCountdown });

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
    );
  if (!game)
    return (
      <div>
        게임을 찾을 수 없습니다. <button onClick={() => navigate('/lobby')}>로비로</button>
      </div>
    );

    const isPlayer1 = user?.id === game.player1_id;

    const myPeriods = isPlayer1 ? game.player1_periods : game.player2_periods;
    const myTimeLeft = isPlayer1 ? game.player1_time_left : game.player2_time_left;
    
    const opponentPeriods = isPlayer1 ? game.player2_periods : game.player1_periods;
    const opponentTimeLeft = isPlayer1 ? game.player2_time_left : game.player1_time_left;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
        <GameHeader game={game} user={user} />
        <GameReadyStatus
  game={game}
  isReady={isReady}
  countdown={countdown}
  periods={myPeriods}
  timeLeft={myTimeLeft}
  opponentPeriods={opponentPeriods}
  opponentTimeLeft={opponentTimeLeft}
/>
        <GameBoard
          game={game}
          user={user}
          onNodeClick={handleNodeClick}
          selectedNode={selectedNode}
        />
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
