import { Game } from '../types/game';

// 두 노드가 연결되어 있는지 확인하는 함수
export function isConnectedNode(
  fromNode: string,
  toNode: string,
  edges: [string, string][]
): boolean {
  return edges.some(
    ([startId, endId]) =>
      (startId === fromNode && endId === toNode) ||
      (startId === toNode && endId === fromNode)
  );
}

// 특정 노드에서 이동 가능한 노드가 있는지 확인하는 함수
export function hasMovableNode(
  nodeId: string,
  occupant: { [key: string]: number },
  edges: [string, string][],
  playerStone: number, // 1: 흑, 2: 백
  initialPositions: { black: string[]; white: string[] } // 초기 위치 정보
): boolean {
  const myInitialPositions =
    playerStone === 1 ? initialPositions.black : initialPositions.white;
  const opponentInitialPositions =
    playerStone === 1 ? initialPositions.white : initialPositions.black;
  return edges.some(([startId, endId]) => {
    const toNode =
      startId === nodeId ? endId : endId === nodeId ? startId : null;
    if (!toNode) return false;

    // 기본 조건: 대상 노드가 비어 있어야 함
    if (occupant[toNode] !== 0) return false;

    // 호박고누 규칙:
    // 1. no_backtrack: 자신의 초기 위치로 돌아갈 수 없음
    if (myInitialPositions.includes(toNode)) return false;
    // 2. no_opponent_line_enter: 상대 출발선으로 들어갈 수 없음
    if (opponentInitialPositions.includes(toNode)) return false;

    return true;
  });
}

// 상대방이 더 이상 이동할 수 없는지 확인하는 승리 조건
export function checkNoMovesWinCondition(
  gameState: Game['game_state'],
  playerStone: number,
  edges: [string, string][],
  initialPositions?: { black: string[]; white: string[] } // 선택적 파라미터로 호박고누 규칙 반영
): boolean {
  const opponentStone = playerStone === 1 ? 2 : 1;
  const opponentNodes = Object.keys(gameState.occupant).filter(
    (nodeId) => gameState.occupant[nodeId] === opponentStone
  );

  // 상대방 돌이 하나도 없는 경우 승리로 판단하지 않음
  if (opponentNodes.length === 0) {
    return false;
  }
  // initialPositions가 제공되면 호박고누 규칙 적용, 없으면 기존 로직 사용
  if (initialPositions) {
    return opponentNodes.every(
      (nodeId) =>
        !hasMovableNode(
          nodeId,
          gameState.occupant,
          edges,
          opponentStone,
          initialPositions
        )
    );
  }

  // 기존 로직 (호박고누 외 게임용)
  return opponentNodes.every(
    (nodeId) =>
      !hasMovableNode(nodeId, gameState.occupant, edges, opponentStone, {
        black: [],
        white: [],
      })
  );
}
