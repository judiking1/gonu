// src/hooks/useGameLogic.ts
import { useState } from 'react';
import { supabase } from '../utils/supabase';
import type { Game } from '../types/game';
import { createGameLogic } from '../gameLogic/factory';

interface UseGameLogicProps {
  game: Game | null;
  user: { id: string } | null;
}

export const useGameLogic = ({ game, user }: UseGameLogicProps) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (!game || !user) {
    return {
      handleNodeClick: () => {},
      handlePlaceStone: () => {},
      handleMoveStone: () => {},
      selectedNode,
    };
  }

  const gameLogic = createGameLogic(game.game_maps?.name || '사방고누'); // 기본값으로 사방고누
  const isMyTurn = game.current_turn === user.id;
  const canPlay = game.status === 'playing' && isMyTurn;
  const occupant = game.game_state.occupant;
  const phase = game.game_state.phase;

  const handlePlaceStone = async (nodeId: string) => {
    if (!canPlay) {
      alert('게임이 시작되지 않았거나 당신의 턴이 아닙니다.');
      return;
    }

    const { valid, message } = gameLogic.canPlaceStone(nodeId, game, user.id);
    if (!valid) {
      alert(message);
      return;
    }

    const newGameState = gameLogic.placeStone(nodeId, game, user.id);
    const myStone = game.player1_id === user.id ? 1 : 2;
    const isWin = gameLogic.checkWinCondition(newGameState, myStone);

    try {
      const { error } = await supabase
        .from('games')
        .update({
          status: isWin ? 'finished' : game.status,
          winner_id: isWin ? user.id : null,
          current_turn: newGameState.currentPlayer,
          game_state: newGameState,
        })
        .eq('id', game.id);
      if (error) throw error;
    } catch (err) {
      console.error('돌 놓기 실패:', err);
    }
  };

  const handleMoveStone = async (fromNode: string, toNode: string) => {
    if (!canPlay) {
      alert('게임이 시작되지 않았거나 당신의 턴이 아닙니다.');
      return;
    }

    const { valid, message } = gameLogic.canMoveStone(fromNode, toNode, game, user.id);
    if (!valid) {
      alert(message);
      return;
    }

    const newGameState = gameLogic.moveStone(fromNode, toNode, game, user.id);
    const myStone = game.player1_id === user.id ? 1 : 2;
    const isWin = gameLogic.checkWinCondition(newGameState, myStone);

    try {
      const { error } = await supabase
        .from('games')
        .update({
          status: isWin ? 'finished' : game.status,
          winner_id: isWin ? user.id : null,
          current_turn: newGameState.currentPlayer,
          game_state: newGameState,
        })
        .eq('id', game.id);
      if (error) throw error;
    } catch (err) {
      console.error('돌 이동 실패:', err);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (!canPlay) return;

    if (phase === 'placement') {
      handlePlaceStone(nodeId);
    } else if (phase === 'movement') {
      if (!selectedNode) {
        const myStone = game.player1_id === user.id ? 1 : 2;
        if (occupant[nodeId] === myStone) {
          setSelectedNode(nodeId);
        } else {
          alert('자신의 돌이 있는 곳을 선택하세요.');
        }
      } else {
        if (selectedNode === nodeId) {
          setSelectedNode(null); // 동일 노드 클릭 시 선택 취소
        } else {
          handleMoveStone(selectedNode, nodeId);
          setSelectedNode(null);
        }
      }
    }
  };

  return { handleNodeClick, handlePlaceStone, handleMoveStone, selectedNode };
};