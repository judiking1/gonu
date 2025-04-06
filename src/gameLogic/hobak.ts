import { Game } from '../types/game';
import { GameLogic } from './types';
import { checkNoMovesWinCondition } from './utils';

export class HobakLogic implements GameLogic {
  canPlaceStone(_nodeId: string, _game: Game, _userId: string) {
    return { valid: false, message: '호박고누는 돌 배치 단계가 없습니다.' };
  }

  placeStone(_nodeId: string, game: Game, _userId: string): Game['game_state'] {
    return game.game_state;
  }

  canMoveStone(fromNode: string, toNode: string, game: Game, userId: string) {
    const { occupant, phase } = game.game_state;
    const isPlayer1 = game.player1_id === userId;
    const myStone = isPlayer1 ? 1 : 2;
    const initialPositions = game.game_maps?.map_data.initial_positions;
    const myInitialPositions = isPlayer1
      ? initialPositions?.black
      : initialPositions?.white;
    const opponentInitialPositions = isPlayer1
      ? initialPositions?.white
      : initialPositions?.black;

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

    // 출발선 내부 이동은 허용 (출발선 내에서의 이동은 가능)
    const isFromInitial = myInitialPositions?.includes(fromNode) || false;
    const isToInitial = myInitialPositions?.includes(toNode) || false;

    // 1. 출발선 밖에서 출발선으로 돌아가는 경우 차단
    if (!isFromInitial && isToInitial) {
      return {
        valid: false,
        message: '한번 출발선을 떠난 돌은 다시 출발선으로 돌아갈 수 없습니다.',
      };
    }

    // 2. 출발선 내부에서의 이동 제한
    if (isFromInitial && isToInitial) {
      // 출발선의 중앙 노드 식별 (3개의 노드 중 가운데)
      // 예: [n0,0, n1,0, n2,0] 중 n1,0이 중앙
      const centerNodeId = this.findCenterNodeOfInitialLine(
        myInitialPositions || []
      );

      // 양 끝에서 중앙으로 이동하는 것은 허용
      // 중앙에서 양 끝으로 이동하는 것은 허용
      // 하지만 한쪽 끝에서 다른 쪽 끝으로 직접 이동하는 것은 금지
      if (fromNode == centerNodeId) {
        return {
          valid: false,
          message: '출발선 내에서는 바깥 방향으로만만 이동할 수 있습니다.',
        };
      }
    }

    // 상대 출발선으로 들어갈 수 없음
    if (opponentInitialPositions?.includes(toNode)) {
      return { valid: false, message: '상대 출발선으로 들어갈 수 없습니다.' };
    }

    return { valid: true };
  }

  // 출발선의 중앙 노드를 찾는 헬퍼 함수
  private findCenterNodeOfInitialLine(initialNodes: string[]): string {
    // 간단한 구현: 3개의 노드 중 가운데 인덱스의 노드를 반환
    // 실제 구현에서는 노드의 위치나 ID 패턴에 따라 중앙 노드를 식별해야 함
    if (initialNodes.length === 3) {
      return initialNodes[1]; // 가운데 노드
    }

    // 노드가 3개가 아닌 경우 첫 번째 노드를 반환 (기본값)
    return initialNodes[0] || '';
  }

  moveStone(
    fromNode: string,
    toNode: string,
    game: Game,
    userId: string
  ): Game['game_state'] {
    const { occupant, phase, blackCount, whiteCount } = game.game_state;
    const isPlayer1 = game.player1_id === userId;
    const myStone = isPlayer1 ? 1 : 2;
    const nextPlayer = isPlayer1 ? game.player2_id : game.player1_id;

    const newOccupant = { ...occupant, [fromNode]: 0, [toNode]: myStone };

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
    playerStone: number,
    edges: [string, string][]
  ): boolean {
    return checkNoMovesWinCondition(gameState, playerStone, edges);
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
      blackCount: initialPositions?.black.length || 3, // pieces_per_player: 3
      whiteCount: initialPositions?.white.length || 3, // pieces_per_player: 3
      currentPlayer: game.player1_id, // 흑이 선공
    };
  }
}
