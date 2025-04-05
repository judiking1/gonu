// src/gameLogic/sabang.ts
import { Game } from "../types/game";
import { GameLogic } from "./types";

export class SabangLogic implements GameLogic {
  canPlaceStone(nodeId: string, game: Game, userId: string) {
    const { occupant, phase, blackCount, whiteCount } = game.game_state;
    const isPlayer1 = game.player1_id === userId;

    if (game.current_turn !== userId) return { valid: false, message: '상대 턴입니다!' };
    if (phase !== 'placement') return { valid: false, message: '이미 배치 단계가 아닙니다.' };
    if (occupant[nodeId] && occupant[nodeId] !== 0) return { valid: false, message: '이미 돌이 있습니다.' };
    if (isPlayer1 && blackCount >= 4) return { valid: false, message: '흑은 이미 4개를 모두 놓았습니다.' };
    if (!isPlayer1 && whiteCount >= 4) return { valid: false, message: '백은 이미 4개를 모두 놓았습니다.' };

    return { valid: true };
  }

  placeStone(nodeId: string, game: Game, userId: string): Game["game_state"] {
    const { occupant, phase, blackCount, whiteCount } = game.game_state;
    const isPlayer1 = game.player1_id === userId;
    const myStone = isPlayer1 ? 1 : 2;

    const newOccupant = { ...occupant, [nodeId]: myStone };
    const newBlackCount = isPlayer1 ? blackCount + 1 : blackCount;
    const newWhiteCount = !isPlayer1 ? whiteCount + 1 : whiteCount;
    const newPhase = newBlackCount === 4 && newWhiteCount === 4 ? 'movement' : phase;
    const nextPlayer = isPlayer1 ? game.player2_id : game.player1_id;

    return {
      occupant: newOccupant,
      phase: newPhase,
      blackCount: newBlackCount,
      whiteCount: newWhiteCount,
      currentPlayer: nextPlayer, // currentPlayer를 명시적으로 업데이트
    };
  }

  canMoveStone(fromNode: string, toNode: string, game: Game, userId: string) {
    const { occupant, phase } = game.game_state;
    const isPlayer1 = game.player1_id === userId;
    const myStone = isPlayer1 ? 1 : 2;

    if (phase !== 'movement') return { valid: false, message: '배치 단계가 끝나지 않았습니다 (movement 아님).' };
    if (occupant[fromNode] !== myStone) return { valid: false, message: '자신의 돌이 아닙니다.' };
    if (occupant[toNode] !== 0) return { valid: false, message: '이미 돌이 있거나 이동 불가.' };
    if (!this.isAdjacentNode(fromNode, toNode)) return { valid: false, message: '인접 노드만 이동 가능합니다.' };

    return { valid: true };
  }

  moveStone(fromNode: string, toNode: string, game: Game, userId: string): Game["game_state"] {
    const { occupant, phase, blackCount, whiteCount } = game.game_state;
    const isPlayer1 = game.player1_id === userId;
    const myStone = isPlayer1 ? 1 : 2;

    const newOccupant = { ...occupant, [fromNode]: 0, [toNode]: myStone };
    const nextPlayer = isPlayer1 ? game.player2_id : game.player1_id;

    return {
      occupant: newOccupant,
      phase, // phase는 movement 상태에서 변경 없음
      blackCount,
      whiteCount,
      currentPlayer: nextPlayer, // currentPlayer를 명시적으로 업데이트
    };
  }

  checkWinCondition(gameState: Game["game_state"], playerStone: number): boolean {
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

    return lines.some((line) =>
      line.every((nId) => gameState.occupant[nId] === playerStone)
    );
  }

  private isAdjacentNode(fromNode: string, toNode: string): boolean {
    const [fx, fy] = fromNode.replace('n', '').split(',').map(Number);
    const [tx, ty] = toNode.replace('n', '').split(',').map(Number);
    const dx = Math.abs(fx - tx);
    const dy = Math.abs(fy - ty);
    return dx <= 1 && dy <= 1 && (dx + dy) !== 0;
  }
}