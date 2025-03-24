import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { useAuthStore } from '../../stores/authStore';
import type { Database } from '../../utils/database.types';

type Game = Database['public']['Tables']['games']['Row'];

export default function Lobby() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadGames();
    // 실시간 업데이트를 위한 구독
    const subscription = supabase
      .channel('games')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
        },
        () => {
          loadGames();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadGames = async () => {
    try {
      const { data: games, error } = await supabase
        .from('games')
        .select(`
          *,
          player1:profiles!games_player1_id_fkey (
            username
          ),
          player2:profiles!games_player2_id_fkey (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading games:', error);
        return;
      }

      // 플레이어가 나간 게임이나 오래된 대기 게임을 필터링
      const now = new Date();
      const filteredGames = (games || []).filter(game => {
        const gameDate = new Date(game.created_at);
        const hoursDiff = (now.getTime() - gameDate.getTime()) / (1000 * 60 * 60);
        
        // 게임이 24시간 이상 지났거나
        if (hoursDiff >= 24) {
          deleteGame(game.id);
          return false;
        }
        
        // 대기 중인 게임이 1시간 이상 지났거나
        if (game.status === 'waiting' && hoursDiff >= 1) {
          deleteGame(game.id);
          return false;
        }
        
        // 게임 생성자가 나간 경우
        if (game.status === 'waiting' && !game.player1_id) {
          deleteGame(game.id);
          return false;
        }

        return true;
      });

      setGames(filteredGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGame = async (gameId: string) => {
    try {
      await supabase
        .from('games')
        .delete()
        .eq('id', gameId);
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  const joinGame = async (gameId: string) => {
    if (!user) {
      alert('게임에 참여하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      // 먼저 게임 상태를 확인
      const { data: gameData, error: checkError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (checkError) {
        console.error('게임 상태 확인 에러:', checkError);
        alert('게임 정보를 확인할 수 없습니다.');
        return;
      }

      if (gameData.player2_id || gameData.status !== 'waiting') {
        alert('이미 다른 플레이어가 참여했거나 게임이 시작되었습니다.');
        return;
      }

      // 게임 참여 시도
      const { error: updateError } = await supabase
        .from('games')
        .update({
          player2_id: user.id,
          player2_ready: false
        })
        .eq('id', gameId);

      if (updateError) {
        console.error('게임 참여 업데이트 에러:', updateError);
        alert('게임 참여에 실패했습니다.');
        return;
      }

      console.log('Joining game:', gameId);
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('게임 참여 에러:', error);
      alert('게임 참여에 실패했습니다.');
    }
  };

  const handleGameClick = (game: Game) => {
    // 이미 참여한 게임이면 게임 페이지로 이동
    if (game.player1_id === user?.id || game.player2_id === user?.id) {
      navigate(`/game/${game.id}`);
      return;
    }

    // 대기 중인 게임이면 참가
    if (game.status === 'waiting' && !game.player2_id) {
      joinGame(game.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">게임 로비</h1>
          <Link
            to="/game/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            새 게임 만들기
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleGameClick(game)}
            >
              <h3 className="text-xl font-bold mb-2">{game.title}</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p>방장: {game.player1?.username || '알 수 없음'}</p>
                  <p>참가자: {game.player2?.username || '대기중'}</p>
                </div>
                <div>
                  <p>상태: {game.status === 'waiting' ? '대기중' : game.status === 'playing' ? '게임중' : '종료'}</p>
                  {user && game.status === 'waiting' && game.player1_id !== user.id && !game.player2_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        joinGame(game.id);
                      }}
                      className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      참가하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 