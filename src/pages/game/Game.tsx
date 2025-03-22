import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import GameChat from '../../components/chat/GameChat';
import { Tables } from '../../utils/supabase';

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
  const [game, setGame] = useState<Game | null>(null);
  const [gameMap, setGameMap] = useState<GameMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameRules, setGameRules] = useState<GameRules | null>(null);

  const loadGame = async () => {
    if (!gameId) {
      console.error('게임 ID가 없습니다.');
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

      setGame(gameData);
      setGameMap(gameData.game_maps);
      setGameState(gameData.game_state as GameState);
      setGameRules(gameData.game_maps.rules as GameRules);
      console.log('게임 상태 설정 완료');
    } catch (error) {
      console.error('Error loading game:', error);
      navigate('/lobby');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Game 컴포넌트 마운트, ID:', gameId);
    loadGame();

    if (!gameId) {
      console.error('유효하지 않은 게임 ID');
      navigate('/lobby');
      return;
    }

    const channel = supabase
      .channel(`game_${gameId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      }, (payload) => {
        console.log('게임 업데이트 수신:', payload);
        setGame(payload.new as Game);
        setGameState(payload.new.game_state as GameState);
      })
      .subscribe();

    return () => {
      console.log('Game 컴포넌트 언마운트');
      channel.unsubscribe();
    };
  }, [gameId, navigate]); // navigate도 의존성에 추가

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
        <h1 className="text-2xl font-bold mb-4">Game {gameId}</h1>
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