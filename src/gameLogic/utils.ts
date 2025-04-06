import { Game } from '../types/game';

// 두 노드가 연결되어 있는지 확인하는 함수
export function isConnectedNode(fromNode: string, toNode: string, edges: [string, string][]): boolean {
  return edges.some(
    ([startId, endId]) =>
      (startId === fromNode && endId === toNode) || (startId === toNode && endId === fromNode)
  );
}

// 특정 노드에서 이동 가능한 노드가 있는지 확인하는 함수
export function hasMovableNode(
  nodeId: string,
  occupant: { [key: string]: number },
  edges: [string, string][]
): boolean {
  return edges.some(([startId, endId]) => {
    if (startId === nodeId && occupant[endId] === 0) return true;
    if (endId === nodeId && occupant[startId] === 0) return true;
    return false;
  });
}

// 상대방이 더 이상 이동할 수 없는지 확인하는 승리 조건
export function checkNoMovesWinCondition(
  gameState: Game['game_state'],
  playerStone: number,
  edges: [string, string][],
): boolean {
  const opponentStone = playerStone === 1 ? 2 : 1;
  const opponentNodes = Object.keys(gameState.occupant).filter(
    (nodeId) => gameState.occupant[nodeId] === opponentStone
  );

  // 상대방 돌이 하나도 없는 경우 승리로 판단하지 않음
  if (opponentNodes.length === 0) {
    return false;
  }

  // 상대방 돌이 이동 가능한 노드가 하나도 없으면 승리
  return opponentNodes.every(
    (nodeId) => !hasMovableNode(nodeId, gameState.occupant, edges)
  );
}