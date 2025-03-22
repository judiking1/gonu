import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { useUserStore } from '../../stores/userStore';

export default function CreateGameButton() {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const createGame = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    const { data, error } = await supabase
      .from('games')
      .insert({
        player1_id: user.id,
        moves: [],
      })
      .select('id')
      .single();

    if (error) {
      alert(`게임 생성 실패: ${error.message}`);
      return;
    }

    navigate(`/game/${data.id}`);
  };

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={createGame}
    >
      새 게임 만들기
    </button>
  );
}
