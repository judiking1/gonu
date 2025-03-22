import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Tables } from '../../utils/supabase';

type Game = Tables['games']['Row'];

const Lobby: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      const { data, error } = await supabase
        .from('games')
        .select('*, game_maps(*), profiles!games_player1_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGame = async () => {
    try {
      // 기본 맵(밭고누)으로 게임 생성
      const { data: mapData } = await supabase
        .from('game_maps')
        .select()
        .eq('name', '밭고누')
        .single();

      if (!mapData) throw new Error('기본 맵을 찾을 수 없습니다.');

      const { data, error } = await supabase.from('games').insert({
        map_id: mapData.id,
        player1_id: user!.id,
        game_state: {
          board: Array(9).fill(null),
          currentPlayer: 1,
        },
        status: 'waiting',
      }).select();

      if (error) throw error;
      if (data) {
        navigate(`/game/${data[0].id}`);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('게임 생성에 실패했습니다.');
    }
  };

  const joinGame = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          player2_id: user!.id,
          status: 'playing',
          current_turn: user!.id,
        })
        .eq('id', gameId);

      if (error) throw error;
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      alert('게임 참여에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">게임 로비</h1>
          <button
            onClick={createGame}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            새 게임 만들기
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-gray-900">
                    {game.status === 'waiting' ? '대기중' : '게임중'}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      game.status === 'waiting'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {game.status}
                  </span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => joinGame(game.id)}
                    disabled={
                      game.status !== 'waiting' || game.player1_id === user?.id
                    }
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      game.status === 'waiting' && game.player1_id !== user?.id
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {game.status === 'waiting' ? '참여하기' : '게임중'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lobby; 