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

      const now = new Date();
      const filteredGames = (games || []).filter(game => {
        const gameDate = new Date(game.created_at);
        const hoursDiff = (now.getTime() - gameDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff >= 24) {
          deleteGame(game.id);
          return false;
        }

        if (game.status === 'waiting' && hoursDiff >= 1) {
          deleteGame(game.id);
          return false;
        }

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
      await supabase.from('games').delete().eq('id', gameId);
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

      const { error: updateError } = await supabase
        .from('games')
        .update({
          player2_id: user.id,
          player2_ready: false,
        })
        .eq('id', gameId);

      if (updateError) {
        console.error('게임 참여 업데이트 에러:', updateError);
        alert('게임 참여에 실패했습니다.');
        return;
      }

      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('게임 참여 에러:', error);
      alert('게임 참여에 실패했습니다.');
    }
  };

  const handleGameClick = (game: Game) => {
    if (game.player1_id === user?.id || game.player2_id === user?.id) {
      navigate(`/game/${game.id}`);
      return;
    }

    if (game.status === 'waiting' && !game.player2_id) {
      joinGame(game.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">게임 로비</h1>
          <Link
            to="/game/create"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            새 게임 만들기
          </Link>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 12H4"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">게임이 없습니다</h3>
            <p className="mt-1 text-gray-500">
              새로운 게임을 만들어 친구들과 함께 즐겨보세요!
            </p>
            <div className="mt-6">
              <Link
                to="/game/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                게임 만들기
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                onClick={() => handleGameClick(game)}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                    {game.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      game.status === 'waiting'
                        ? 'bg-yellow-100 text-yellow-800'
                        : game.status === 'playing'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {game.status === 'waiting'
                      ? '⏳ 대기중'
                      : game.status === 'playing'
                      ? '🚩 게임중'
                      : '🏁 종료'}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">방장:</span>{' '}
                    {game.player1?.username || '알 수 없음'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">참가자:</span>{' '}
                    {game.player2?.username || '대기중'}
                  </p>
                </div>
                {user &&
                  game.status === 'waiting' &&
                  game.player1_id !== user.id &&
                  !game.player2_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        joinGame(game.id);
                      }}
                      className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      참가하기
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}