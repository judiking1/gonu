import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import type { Game } from '../types/game';

interface UseGameActionsProps {
  game: Game | null;
  user: { id: string } | null;
  isReady: boolean;
  setIsReady: (ready: boolean) => void;
}

function checkWinCondition_Sabang(
  occupant: Record<string, number>,
  myStone: number
): boolean {
  // nodeId => "n0,0" ~ "n2,2"
  // 3줄 검사
  // 가로: n{r,0} n{r,1} n{r,2}
  // 세로: n{0,c} n{1,c} n{2,c}
  // 대각: n0,0 n1,1 n2,2 / n0,2 n1,1 n2,0

  const lines = [
    ['n0,0', 'n0,1', 'n0,2'],
    ['n1,0', 'n1,1', 'n1,2'],
    ['n2,0', 'n2,1', 'n2,2'],
    ['n0,0', 'n1,0', 'n2,0'],
    ['n0,1', 'n1,1', 'n2,1'],
    ['n0,2', 'n1,2', 'n2,2'],
    ['n0,0', 'n1,1', 'n2,2'],
    ['n0,2', 'n1,1', 'n2,0'],
  ];

  for (const line of lines) {
    if (line.every((nId) => occupant[nId] === myStone)) {
      return true;
    }
  }
  return false;
}

export const useGameActions = ({
  game,
  user,
  isReady,
  setIsReady,
}: UseGameActionsProps) => {
  const navigate = useNavigate();

  async function resetGameStateForRematch() {
    if (!game) return;

    // 예: 사방고누 가정
    // occupant 노드 전부 0, blackCount=0, whiteCount=0, phase='placement'
    const occupant = { ...game.game_state.occupant };
    Object.keys(occupant).forEach((nodeId) => {
      occupant[nodeId] = 0;
    });

    const newGameState = {
      ...game.game_state,
      occupant,
      phase: 'placement',
      blackCount: 0,
      whiteCount: 0,
    };

    // DB 업데이트
    const { error } = await supabase
      .from('games')
      .update({
        winner_id: null,
        status: 'waiting',
        current_turn: game.player1_id, // 흑이 선공, 혹은 null
        countdown_start: null,
        game_state: newGameState,
      })
      .eq('id', game.id);

    if (error) {
      console.error('게임 리셋 실패:', error);
    }
  }

  const handleReady = async () => {
    if (!game || !user) return;
    if (game.status === 'finished') {
      await resetGameStateForRematch();
    }

    const isPlayer1 = game.player1_id === user.id;
    const updateData = isPlayer1
      ? { player1_ready: !isReady }
      : { player2_ready: !isReady };

    try {
      if (isReady) {
        const { error } = await supabase
          .from('games')
          .update({
            ...updateData,
            status: 'waiting',
            countdown_start: null,
          })
          .eq('id', game.id);

        if (error) throw error;
      } else {
        const { error: updateError } = await supabase
          .from('games')
          .update({
            ...updateData,
            status: 'waiting',
            winner_id: null,
          })
          .eq('id', game.id);

        if (updateError) throw updateError;

        const { data: currentGame, error: checkError } = await supabase
          .from('games')
          .select('*')
          .eq('id', game.id)
          .single();

        if (checkError) throw checkError;

        if (
          (isPlayer1 && currentGame.player2_ready) ||
          (!isPlayer1 && currentGame.player1_ready)
        ) {
          const { error: startError } = await supabase
            .from('games')
            .update({
              countdown_start: new Date().toISOString(),
            })
            .eq('id', game.id);

          if (startError) throw startError;
        }
      }

      setIsReady(!isReady);
    } catch (error) {
      console.error('준비 상태 변경 실패:', error);
    }
  };

  const handleSurrender = async () => {
    if (!game || !user) return;

    if (
      !window.confirm(
        '정말 기권하시겠습니까? 상대방의 승리로 게임이 종료됩니다.'
      )
    ) {
      return;
    }

    try {
      const winnerId =
        game.player1_id === user.id ? game.player2_id : game.player1_id;
      await supabase
        .from('games')
        .update({
          status: 'finished',
          winner_id: winnerId,
          player1_ready: false,
          player2_ready: false,
        })
        .eq('id', game.id);
    } catch (error) {
      console.error('기권 처리 실패:', error);
    }
  };

  const leaveGame = async () => {
    if (!game || !user) return;

    if (
      game.status === 'playing' &&
      !window.confirm(
        '게임 진행 중에 나가시면 기권 처리됩니다. 정말 나가시겠습니까?'
      )
    ) {
      return;
    }

    try {
      const isPlayer1 = game.player1_id === user.id;
      const isPlayer2 = game.player2_id === user.id;

      if (isPlayer1) {
        if (game.status === 'playing') {
          await supabase
            .from('games')
            .update({
              status: 'finished',
              winner_id: game.player2_id,
            })
            .eq('id', game.id);
        } else {
          await supabase.from('games').delete().eq('id', game.id);
        }
      } else if (isPlayer2) {
        if (game.status === 'playing') {
          await supabase
            .from('games')
            .update({
              status: 'finished',
              winner_id: game.player1_id,
            })
            .eq('id', game.id);
        } else {
          await supabase
            .from('games')
            .update({
              player2_id: null,
              player2_ready: false,
              status: 'waiting',
            })
            .eq('id', game.id);
        }
      }

      navigate('/lobby');
    } catch (error) {
      console.error('게임 나가기 실패:', error);
    }
  };

  const handlePlaceStone = (nodeId: string) => {
    if (!game || !user) return;
    if (game.status !== 'playing') {
      alert('아직 게임이 시작되지 않았습니다.');
      return;
    }

    // 게임 이름에 따라 분기
    const mapName = game.game_maps?.name;
    switch (mapName) {
      case '사방고누':
        placeStone_Sabang(nodeId);
        break;
      case '우물고누':
        placeStone_Umul(nodeId);
        break;
      case '호박고누':
        placeStone_Hobak(nodeId);
        break;
      default:
        alert('알 수 없는 게임입니다.');
        break;
    }
  };

  // occupant 기반으로 돌 놓기
  async function placeStone_Sabang(nodeId: string) {
    const { occupant, phase, blackCount, whiteCount } = game!.game_state;
    // 현재 턴인지 체크
    if (game!.current_turn !== user!.id) {
      alert('상대 턴입니다!');
      return;
    }

    // 지금은 사방고누 placement 단계만 예시
    if (phase !== 'placement') {
      alert('이미 배치 단계가 아닙니다.');
      return;
    }

    const isPlayer1 = game!.player1_id === user!.id;
    const myStone = isPlayer1 ? 1 : 2;

    // 이미 돌이 놓여있는지 확인
    if (occupant[nodeId] && occupant[nodeId] !== 0) {
      alert('이미 돌이 있습니다.');
      return;
    }

    // 각자 4개까지 놓을 수 있는지
    if (isPlayer1 && blackCount >= 4) {
      alert('흑은 이미 4개를 모두 놓았습니다.');
      return;
    }
    if (!isPlayer1 && whiteCount >= 4) {
      alert('백은 이미 4개를 모두 놓았습니다.');
      return;
    }

    // 돌 놓기
    occupant[nodeId] = myStone;

    // 돌 개수 증가
    const newBlackCount = isPlayer1 ? blackCount + 1 : blackCount;
    const newWhiteCount = !isPlayer1 ? whiteCount + 1 : whiteCount;

    // 다음 턴 설정
    const nextPlayer = isPlayer1 ? game!.player2_id : game!.player1_id;

    const isWin = checkWinCondition_Sabang(occupant, myStone);

    let newPhase: 'placement' | 'movement' = phase;
    let newStatus: 'waiting' | 'playing' | 'finished' = game!.status;
    let newWinner: string | null = null;

    if (isWin) {
      newStatus = 'finished';
      newWinner = user!.id;
    } else {
      // 둘 다 4개 놓았으면 movement 단계
      if (newBlackCount === 4 && newWhiteCount === 4) {
        newPhase = 'movement';
      }
    }

    try {
      const { error } = await supabase
        .from('games')
        .update({
          status: newStatus,
          winner_id: newWinner,
          current_turn: nextPlayer,
          game_state: {
            ...game!.game_state,
            occupant,
            blackCount: newBlackCount,
            whiteCount: newWhiteCount,
            phase: newPhase,
          },
        })
        .eq('id', game!.id);

      if (error) throw error;
    } catch (err) {
      console.error('사방고누 돌 놓기 실패:', err);
    }
  }

  async function placeStone_Umul(nodeId: string) {
    // 우물고누는 곧바로 이동 단계?
    // 혹은 occupant[nodeId] = myStone
    // 여기선 예시로 "움직이는" 게임이라 가정
    alert(
      `우물고누는 이동형 게임입니다. 별도 로직 필요! 선택된 노드: ${nodeId}`
    );
    // 구현 시 occupant/nodeId 를 업데이트 or from->to 이동
  }

  // =========================
  // 호박고누 로직
  // =========================
  async function placeStone_Hobak(nodeId: string) {
    // 호박고누 역시 "상대방을 포위하여 움직이지 못하게" 등 규칙
    // 여기서 occupant 업데이트 or 이동 로직
    alert(`호박고누 로직을 구현해주세요! 선택된 노드: ${nodeId}`);
  }

  const handleMoveStone = (fromNode: string, toNode: string) => {
    if (!game || !user) return;
    if (game.status !== 'playing') {
      alert('게임이 시작되지 않았습니다.');
      return;
    }

    const mapName = game.game_maps?.name;
    switch (mapName) {
      case '사방고누':
        moveStone_Sabang(fromNode, toNode);
        break;
      case '우물고누':
        moveStone_Umul(fromNode, toNode);
        break;
      case '호박고누':
        moveStone_Hobak(fromNode, toNode);
        break;
      default:
        alert('알 수 없는 게임입니다.');
        break;
    }
  };

  async function moveStone_Sabang(fromNode: string, toNode: string) {
    // 1) phase === 'movement'인지 체크
    if (game!.game_state.phase !== 'movement') {
      alert('배치 단계가 끝나지 않았습니다 (movement 아님).');
      return;
    }

    // 2) 내 돌인지 확인
    const occupant = { ...game!.game_state.occupant };
    const isPlayer1 = (game!.player1_id === user!.id);
    const myStone = isPlayer1 ? 1 : 2;

    if (occupant[fromNode] !== myStone) {
      alert('자신의 돌이 아닙니다.');
      return;
    }
    if (occupant[toNode] !== 0) {
      alert('이미 돌이 있거나 이동 불가.');
      return;
    }

    // 3) 인접 노드인지 검사 (사방고누는 3x3이므로 상하좌우,대각? 규칙에 따라)
    if (!isAdjacentNode(fromNode, toNode)) {
      alert('인접 노드만 이동 가능합니다.');
      return;
    }

    // 4) 이동
    occupant[fromNode] = 0;
    occupant[toNode] = myStone;

    // 5) 턴 교체
    const nextTurn = isPlayer1 ? game!.player2_id : game!.player1_id;

    // 6) 승리 검사
    const isWin = checkWinCondition_Sabang(occupant, myStone);
    let newStatus = game!.status;
    let newWinner = null;
    if (isWin) {
      newStatus = 'finished';
      newWinner = user!.id;
    }

    // 7) DB 업데이트
    try {
      const { error } = await supabase
        .from('games')
        .update({
          status: newStatus,
          winner_id: newWinner,
          current_turn: nextTurn,
          game_state: {
            ...game!.game_state,
            occupant,
          }
        })
        .eq('id', game!.id);
      if (error) throw error;

    } catch (err) {
      console.error('돌 이동 실패:', err);
    }
  }

  // #2. 우물고누, 호박고누 로직
  async function moveStone_Umul(fromNode: string, toNode: string) {
    // 예: 우물고누는 특정 선만 이동 가능, 우물 표시는 막힘, etc.
    alert(`우물고누 이동: ${fromNode}→${toNode} (미구현)`);
  }

  async function moveStone_Hobak(fromNode: string, toNode: string) {
    // 예: 호박고누는 점프, 포획 규칙...
    alert(`호박고누 이동: ${fromNode}→${toNode} (미구현)`);
  }

  function isAdjacentNode(fromNode: string, toNode: string) {
    // 예: 'n0,0' ~ 'n2,2'
    // 인덱스 파싱 -> 상하좌우 or 대각선
    const [fx, fy] = fromNode.replace('n','').split(',').map(Number);
    const [tx, ty] = toNode.replace('n','').split(',').map(Number);
    const dx = Math.abs(fx - tx);
    const dy = Math.abs(fy - ty);

    // 사방고누 예시: 한 칸 이동(상하좌우+대각 가능?)
    // 여기선 상하좌우+대각(최대 1칸 이동)라고 가정:
    return (dx <= 1 && dy <= 1 && (dx+dy !== 0));
  }
  
  return {
    handleReady,
    handleSurrender,
    leaveGame,
    handlePlaceStone,
    handleMoveStone
  };
};
