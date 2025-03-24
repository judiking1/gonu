import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import GameChat from '../../components/chat/GameChat';
import { Tables } from '../../utils/supabase';
import { useAuthStore } from '../../stores/authStore';

type Game = Tables['games']['Row'];
type GameMap = Tables['game_maps']['Row'];

interface GameRules {
  board_size: number;
  win_condition: string;
  move_rules: string[];
}

interface GameState {
  board: string[][];
  currentPlayer: string;
}

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [game, setGame] = useState<Game | null>(null);
  const [gameMap, setGameMap] = useState<GameMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameRules, setGameRules] = useState<GameRules | null>(null);
  const [isReady, setIsReady] = useState(false);

  const loadGame = async () => {
    if (!gameId || !user) {
      console.error('게임 ID가 없거나 로그인되지 않았습니다.');
      navigate('/lobby');
      return;
    }

    try {
      console.log('게임 데이터 로딩 시작:', gameId);
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          game_maps (*)
        `)
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('게임 데이터 로딩 에러:', gameError);
        throw gameError;
      }

      console.log('로드된 게임 데이터:', gameData);
      
      if (!gameData) {
        console.error('게임 데이터가 없습니다.');
        navigate('/lobby');
        return;
      }

      if (!gameData.game_maps) {
        console.error('게임 맵 데이터가 없습니다:', gameData);
        navigate('/lobby');
        return;
      }

      // 자신이 플레이어1이나 플레이어2가 아닌 경우 로비로 이동
      if (gameData.player1_id !== user.id && gameData.player2_id !== user.id) {
        console.error('이 게임에 참여할 수 없습니다.');
        navigate('/lobby');
        return;
      }

      setGame(gameData);
      setGameMap(gameData.game_maps);
      setGameState(gameData.game_state as GameState);
      setGameRules(gameData.game_maps.rules as GameRules);
      setIsReady(gameData.player1_id === user.id ? gameData.player1_ready : gameData.player2_ready);
      console.log('게임 상태 설정 완료');
    } catch (error) {
      console.error('Error loading game:', error);
      navigate('/lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleReady = async () => {
    if (!game || !user) return;

    const isPlayer1 = game.player1_id === user.id;
    const updateData = isPlayer1
      ? { player1_ready: !isReady }
      : { player2_ready: !isReady };

    try {
      const { error } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', game.id);

      if (error) throw error;
      setIsReady(!isReady);

      // 양쪽 모두 준비 완료면 게임 시작
      if (game.player1_ready && game.player2_ready) {
        await supabase
          .from('games')
          .update({ status: 'playing' })
          .eq('id', game.id);
      }
    } catch (error) {
      console.error('준비 상태 변경 실패:', error);
    }
  };

  const leaveGame = async () => {
    if (!game || !user) return;

    try {
      const isPlayer1 = game.player1_id === user.id;
      const isPlayer2 = game.player2_id === user.id;

      if (isPlayer1) {
        // 플레이어1이 나가면 게임 삭제
        await supabase
          .from('games')
          .delete()
          .eq('id', game.id);
      } else if (isPlayer2) {
        // 플레이어2가 나가면 상태 초기화
        await supabase
          .from('games')
          .update({
            player2_id: null,
            player2_ready: false,
            status: 'waiting'
          })
          .eq('id', game.id);
      }

      navigate('/lobby');
    } catch (error) {
      console.error('게임 나가기 실패:', error);
    }
  };

  useEffect(() => {
    console.log('Game 컴포넌트 마운트, ID:', gameId);
    loadGame();

    if (!gameId || !user) {
      console.error('유효하지 않은 게임 ID 또는 로그인되지 않음');
      navigate('/lobby');
      return;
    }

    const channel = supabase
      .channel(`game_${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        console.log('게임 업데이트 수신:', payload);
        if (payload.eventType === 'DELETE') {
          alert('게임방이 삭제되었습니다.');
          navigate('/lobby');
          return;
        }
        const updatedGame = payload.new as Game;
        // player1이 나갔거나 player2가 혼자 남은 경우
        if (!updatedGame.player1_id || (user.id === updatedGame.player2_id && !updatedGame.player1_id)) {
          alert('방장이 나갔습니다. 로비로 이동합니다.');
          navigate('/lobby');
          return;
        }
        setGame(updatedGame);
        const gameStateData = updatedGame.game_state as unknown as GameState;
        setGameState(gameStateData);
        setIsReady(
          updatedGame.player1_id === user.id 
            ? updatedGame.player1_ready 
            : updatedGame.player2_ready
        );
      })
      .subscribe();

    // 페이지를 나갈 때 게임에서 나가기
    const handleBeforeUnload = () => {
      leaveGame();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      console.log('Game 컴포넌트 언마운트');
      window.removeEventListener('beforeunload', handleBeforeUnload);
      channel.unsubscribe();
      leaveGame();
    };
  }, [gameId, navigate, user]);

  console.log('현재 상태:', { loading, game, gameMap, gameState, gameRules });

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }

  if (!game || !gameState || !gameRules || !gameId || !gameMap) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl text-gray-600">게임을 찾을 수 없습니다.</div>
    </div>;
  }

  return (
    <div className="flex flex-row gap-4 p-4">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Game {gameId}</h1>
          <div className="flex gap-2">
            <button
              onClick={handleReady}
              className={`px-4 py-2 rounded-md ${
                isReady
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              } text-white`}
            >
              {isReady ? '준비 완료' : '준비하기'}
            </button>
            <button
              onClick={leaveGame}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              나가기
            </button>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">플레이어 1</p>
              <p className="font-medium">{game.player1_id}</p>
              {game.player1_ready && <span className="text-green-600">준비 완료</span>}
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-indigo-600">{game.status}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">플레이어 2</p>
              <p className="font-medium">{game.player2_id || '대기 중...'}</p>
              {game.player2_ready && <span className="text-green-600">준비 완료</span>}
            </div>
          </div>
        </div>
        <div 
          className="grid gap-1 bg-gray-200 p-4 rounded-lg"
          style={{
            gridTemplateColumns: `repeat(${gameRules.board_size}, minmax(0, 1fr))`
          }}
        >
          {gameState.board.flat().map((cell, index) => (
            <div
              key={index}
              className="aspect-square bg-white rounded-sm flex items-center justify-center"
            >
              {cell}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">{gameMap.name}</h2>
          <p className="text-gray-600">{gameMap.description}</p>
        </div>
      </div>
      <div className="w-80">
        <GameChat gameId={gameId} />
      </div>
    </div>
  );
} 