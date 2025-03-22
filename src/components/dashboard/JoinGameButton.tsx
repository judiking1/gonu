import { supabase } from '../../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';

interface JoinGameButtonProps {
  gameId: string;
}

export default function JoinGameButton({ gameId }: JoinGameButtonProps) {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const joinGame = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    const { error } = await supabase
      .from('games')
      .update({ player2_id: user.id })
      .eq('id', gameId);

    if (error) {
      alert(`게임 참가 실패: ${error.message}`);
      return;
    }

    navigate(`/game/${gameId}`);
  };

  return (
    <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={joinGame}>
      게임 참여하기
    </button>
  );
}
