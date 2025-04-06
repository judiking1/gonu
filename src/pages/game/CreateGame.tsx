// src/pages/CreateGame.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { useAuthStore } from '../../stores/authStore';
import type { Database } from '../../utils/database.types';
import { UmulLogic } from '../../gameLogic/umul';
import { SabangLogic } from '../../gameLogic/sabang';
import { HobakLogic } from '../../gameLogic/hobak';

type GameMap = Database['public']['Tables']['game_maps']['Row'];

const CreateGame: React.FC = () => {
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<string>('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

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
      if (data && data.length > 0) {
        setSelectedMap(data[0].id);
      }
    } catch (error) {
      console.error('맵 로딩 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      if (!selectedMap) {
        alert('맵을 선택해주세요.');
        return;
      }
      if (!title.trim()) {
        alert('방제목을 입력해주세요.');
        return;
      }
      if (!user) {
        alert('로그인이 필요합니다.');
        return;
      }

      const selectedMapData = maps.find((m) => m.id === selectedMap);
      if (!selectedMapData) {
        alert('맵 정보를 찾을 수 없습니다.');
        return;
      }

      // 게임 기본 데이터 (game_maps 컬럼 제거)
      const gameData = {
        title: title.trim(),
        map_id: selectedMap,
        player1_id: user.id,
        status: 'waiting' as const,
        player1_ready: false,
        player2_ready: false,
      };

      // game_maps 데이터를 포함한 임시 Game 객체 생성
      const tempGame = {
        ...gameData,
        game_maps: selectedMapData,
      };

      // 맵 이름에 따라 초기 game_state 설정
      let initialGameState;
      switch (selectedMapData.name) {
        case '우물고누':
          initialGameState = UmulLogic.initializeGameState(tempGame as any);
          break;
        case '사방고누':
          initialGameState = SabangLogic.initializeGameState(tempGame as any);
          break;
        case '호박고누':
          initialGameState = HobakLogic.initializeGameState(tempGame as any);
          break;
        default:
          throw new Error(`알 수 없는 게임 맵: ${selectedMapData.name}`);
      }

      const { data, error } = await supabase
        .from('games')
        .insert({
          ...gameData,
          game_state: initialGameState,
          current_turn: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('게임 데이터를 찾을 수 없습니다.');

      console.log('Created game:', data);
      navigate(`/game/${data.id}`);
    } catch (error) {
      console.error('게임 생성 에러:', error);
      alert('게임 생성에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">새 게임 만들기</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          게임 맵을 선택하고 게임을 시작하세요.
        </p>
      </div>
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                방제목
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
                placeholder="방제목을 입력하세요"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="map" className="block text-sm font-medium text-gray-700">
                맵 선택
              </label>
              <select
                id="map"
                value={selectedMap}
                onChange={(e) => setSelectedMap(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {maps.map((map) => (
                  <option key={map.id} value={map.id}>
                    {map.name} - {map.description}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleCreateGame}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                게임 만들기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;