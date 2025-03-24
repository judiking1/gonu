import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../utils/supabase';
import type { Database } from '../../utils/database.types';

type GameMap = Database['public']['Tables']['game_maps']['Row'];

export default function CreateGame() {
  const [selectedMap, setSelectedMap] = useState<GameMap | null>(null);
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      const { data, error } = await supabase
        .from('game_maps')
        .select('*')
        .order('name');

      if (error) throw error;

      setMaps(data || []);
    } catch (error) {
      console.error('Error loading maps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    if (!selectedMap || !user || !title) return;

    const { data: game, error } = await supabase
      .from('games')
      .insert({
        map_id: selectedMap.id,
        player1_id: user.id,
        game_state: {
          board: Array(selectedMap.board_size)
            .fill(null)
            .map(() => Array(selectedMap.board_size).fill(0)),
          currentPlayer: user.id,
        },
        status: 'waiting',
        title: title,
        player1_ready: false,
        player2_ready: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating game:', error);
      return;
    }

    navigate(`/game/${game.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">새 게임 만들기</h1>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          게임 제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="게임 제목을 입력하세요"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {maps.map((map) => (
            <div
              key={map.id}
              className={`border p-4 rounded-lg cursor-pointer ${
                selectedMap?.id === map.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => setSelectedMap(map)}
            >
              <h2 className="text-xl font-semibold mb-2">{map.name}</h2>
              <p className="text-gray-600 mb-4">{map.description}</p>
              <p className="text-sm text-gray-500">
                보드 크기: {map.board_size}x{map.board_size}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8">
        <button
          onClick={handleCreateGame}
          disabled={!selectedMap || !title}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            selectedMap && title
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          게임 만들기
        </button>
      </div>
    </div>
  );
} 