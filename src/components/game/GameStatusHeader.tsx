import React from 'react';
import type { Game } from '../../types/game';

interface GameStatusHeaderProps {
  game: Game;
  user: { id: string } | null;
  isReady: boolean;
  countdown: number | null;
  periods: number;
  timeLeft: number;
  opponentPeriods: number;
  opponentTimeLeft: number;
}

export const GameStatusHeader: React.FC<GameStatusHeaderProps> = ({
  game,
  user,
  isReady,
  countdown,
  periods,
  timeLeft,
  opponentPeriods,
  opponentTimeLeft,
}) => {
  const isPlayer1 = user?.id === game.player1_id;
  const statusMap: Record<string, string> = {
    waiting: '⏳ 대기중',
    playing: '🚩 게임중',
    finished: game.winner_id === user?.id ? '🎉 승리!' : '😢 패배...',
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Game Title and Status */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800 flex-1 text-center">
          {game.title}
        </h1>
        <p className="text-xl font-semibold text-purple-600">
          {statusMap[game.status]}
        </p>
      </div>

      {/* Player Information */}
      <div className="flex justify-between items-start bg-gray-100 p-4 rounded-md">
        {/* Player 1 (Leader) */}
        <div className="text-left w-1/2 pr-2">
          <p className="text-gray-700 font-semibold">👑 방장</p>
          <p className="text-lg font-bold text-indigo-700">
            {game.player1?.username || '비어 있음'}
          </p>
          {(game.status === 'waiting' || game.status === 'finished') && (
            <p
              className={`font-semibold mt-2 ${
                game.player1_ready ? 'text-green-500' : 'text-gray-400'
              }`}
            >
              {game.player1_ready ? '✅ 준비 완료' : '⏳ 대기중'}
            </p>
          )}
          {game.status === 'playing' && (
            <p className="text-blue-700 font-medium mt-2 whitespace-nowrap">
              ⏱ {isPlayer1 ? timeLeft : opponentTimeLeft}초 / 기회{' '}
              {isPlayer1 ? periods : opponentPeriods}회
            </p>
          )}
        </div>

        {/* Player 2 (Participant) */}
        <div className="text-right w-1/2 pl-2">
          <p className="text-gray-700 font-semibold">🎮 참가자</p>
          <p className="text-lg font-bold text-indigo-700">
            {game.player2?.username || '대기 중'}
          </p>
          {(game.status === 'waiting' || game.status === 'finished') &&
            game.player2_id && (
              <p
                className={`font-semibold mt-2 ${
                  game.player2_ready ? 'text-green-500' : 'text-gray-400'
                }`}
              >
                {game.player2_ready ? '✅ 준비 완료' : '⏳ 대기중'}
              </p>
            )}
          {game.status === 'playing' && game.player2_id && (
            <p className="text-blue-700 font-medium mt-2 whitespace-nowrap">
              ⏱ {isPlayer1 ? opponentTimeLeft : timeLeft}초 / 기회{' '}
              {isPlayer1 ? opponentPeriods : periods}회
            </p>
          )}
        </div>
      </div>

      {/* Countdown and Ready Status */}
      {(game.status === 'waiting' || game.status === 'finished') && (
        <div className="text-center mt-4">
          <p
            className={`text-xl font-semibold ${
              isReady ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isReady ? '✅ 준비 완료' : '❗ 준비해주세요'}
          </p>
          {game.player1_ready && game.player2_ready && countdown !== null && (
            <p className="text-xl font-bold text-indigo-600 mt-2">
              {countdown}초 후 게임이 시작됩니다 🚀
            </p>
          )}
        </div>
      )}
    </div>
  );
};
