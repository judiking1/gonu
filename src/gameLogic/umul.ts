// src/gameLogic/umul.ts
import { Game } from '../types/game';
import { GameLogic } from './types';

export class UmulLogic implements GameLogic {
  private moveCount: number = 0; // 첫 수 제한을 위한 카운터

  canPlaceStone(nodeId: string, game: Game, userId: string) {
    return { valid: false, message: '우물고누는 돌 배치 단계가 없습니다.' };
  }

  placeStone(nodeId: string, game: Game, userId: string): Game['game_state'] {
    return game.game_state;
  }

  canMoveStone(fromNode: string, toNode: string, game: Game, userId: string) {
    const { occupant, phase } = game.game_state;
    const isPlayer1 = game.player1_id === userId;
    const myStone = isPlayer1 ? 1 : 2;

    if (game.current_turn !== userId)
      return { valid: false, message: '상대 턴입니다!' };
    if (phase !== 'movement')
      return { valid: false, message: '움직임 단계가 아닙니다.' };
    if (occupant[fromNode] !== myStone)
      return { valid: false, message: '자신의 돌이 아닙니다.' };
    if (occupant[toNode] !== 0)
      return { valid: false, message: '이미 돌이 있거나 이동 불가.' };
    if (!this.isConnectedNode(fromNode, toNode, game))
      return { valid: false, message: '선으로 연결된 노드만 이동 가능합니다.' };

    // 흑의 첫 수 제한: n1,0 -> n1,1 불가
    if (
      isPlayer1 &&
      this.moveCount === 0 &&
      fromNode === 'n1,0' &&
      toNode === 'n1,1'
    ) {
      return {
        valid: false,
        message: '흑의 첫 수로 (1,0)에서 (1,1)로 이동할 수 없습니다.',
      };
    }

    return { valid: true };
  }

  moveStone(
    fromNode: string,
    toNode: string,
    game: Game,
    userId: string
  ): Game['game_state'] {
    const { occupant, phase, blackCount, whiteCount, currentPlayer } =
      game.game_state;
    const isPlayer1 = game.player1_id === userId;
    const myStone = isPlayer1 ? 1 : 2;
    const nextPlayer = isPlayer1 ? game.player2_id : game.player1_id;

    const newOccupant = { ...occupant, [fromNode]: 0, [toNode]: myStone };
    this.moveCount++; // 이동 횟수 증가

    return {
      occupant: newOccupant,
      phase,
      blackCount,
      whiteCount,
      currentPlayer: nextPlayer,
    };
  }

  checkWinCondition(
    gameState: Game['game_state'],
    playerStone: number
  ): boolean {
    const opponentStone = playerStone === 1 ? 2 : 1;
    const opponentNodes = Object.keys(gameState.occupant).filter(
      (nodeId) => gameState.occupant[nodeId] === opponentStone
    );

    // 상대방 돌이 이동 가능한 노드가 하나도 없으면 승리
    return opponentNodes.every(
      (nodeId) => !this.hasMovableNode(nodeId, gameState)
    );
  }

  private isConnectedNode(
    fromNode: string,
    toNode: string,
    game: Game
  ): boolean {
    const edges = game.game_maps?.map_data.edges || [];
    return edges.some(
      ([startId, endId]) =>
        (startId === fromNode && endId === toNode) ||
        (startId === toNode && endId === fromNode)
    );
  }

  private hasMovableNode(
    nodeId: string,
    gameState: Game['game_state']
  ): boolean {
    const edges = [
      ['n1,0', 'n0,1'],
      ['n0,1', 'n1,1'],
      ['n0,1', 'n1,2'],
      ['n1,0', 'n1,1'],
      ['n1,1', 'n1,2'],
      ['n1,0', 'n2,1'],
      ['n1,1', 'n2,1'],
    ];
    const occupant = gameState.occupant;

    // 현재 노드와 연결된 노드 중 빈 노드가 있는지 확인
    return edges.some(([startId, endId]) => {
      if (startId === nodeId && occupant[endId] === 0) return true;
      if (endId === nodeId && occupant[startId] === 0) return true;
      return false;
    });
  }

  static initializeGameState(game: Game): Game['game_state'] {
    const occupant: { [key: string]: number } = {};
    const initialPositions = game.game_maps?.map_data.initial_positions;

    // 모든 노드를 0으로 초기화
    game.game_maps?.map_data.nodes.forEach((node) => {
      occupant[node.id] = 0;
    });

    // 흑돌 초기 위치 (1)
    initialPositions?.black.forEach((nodeId) => {
      occupant[nodeId] = 1;
    });

    // 백돌 초기 위치 (2)
    initialPositions?.white.forEach((nodeId) => {
      occupant[nodeId] = 2;
    });

    return {
      occupant,
      phase: 'movement', // 바로 movement 단계로 시작
      blackCount: initialPositions?.black.length || 2,
      whiteCount: initialPositions?.white.length || 2,
      currentPlayer: game.player1_id, // 흑이 선공
    };
  }
}
