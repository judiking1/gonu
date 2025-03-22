import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { useAuthStore } from '../../stores/authStore';
import type { Database } from '../../utils/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Game = Database['public']['Tables']['games']['Row'];

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    loadProfile();
    loadGames();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      setUsername(data.username);
    } catch (error) {
      console.error('프로필 로딩 에러:', error);
    }
  };

  const loadGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('게임 기록 로딩 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', userId);

      if (error) throw error;
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error('프로필 업데이트 에러:', error);
      alert('프로필 업데이트에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <div>프로필을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">프로필</h3>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">사용자 이름</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing && user?.id === userId ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>{profile.username}</span>
                  {user?.id === userId && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      수정
                    </button>
                  )}
                </div>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">최근 게임</h3>
      </div>
      <div className="border-t border-gray-200">
        {games.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {games.map((game) => (
              <li key={game.id} className="px-4 py-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(game.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      game.status === 'waiting'
                        ? 'bg-yellow-100 text-yellow-800'
                        : game.status === 'playing'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {game.status === 'waiting'
                      ? '대기중'
                      : game.status === 'playing'
                      ? '진행중'
                      : '완료'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-4 text-sm text-gray-500">게임 기록이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default Profile; 