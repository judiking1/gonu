import React, { useState } from 'react';
import type { Game } from '../../types/game';

interface GameBoardProps {
  game: Game;
  user: { id: string } | null;
  onPlaceStone: (nodeId: string) => void; // row,col 대신 nodeId를 넘김
  onMoveStone: (fromNode: string, toNode: string) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  user,
  onPlaceStone,
  onMoveStone,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const isMyTurn = game.current_turn === user?.id;
  const canPlay = game.status === 'playing' && isMyTurn;

  // map_data에 node, edge가 있다고 가정
  const mapData = game.game_maps?.map_data;
  // occupant = { "n0,0": 0, "n1,0": 1, ... }
  const occupant = game.game_state.occupant;
  const phase = game.game_state.phase;
  if (!mapData || !mapData.nodes || !mapData.edges) {
    return <div>맵 데이터가 없습니다.</div>;
  }
  if (!occupant) {
    return <div>돌 상태(occupant)가 없습니다.</div>;
  }

  // 화면에 배치할 때, (x,y)의 픽셀 간격
  const SPACING = 100;

  // 노드 좌표 최댓값 계산
  const maxX = Math.max(...mapData.nodes.map((n: any) => n.x));
  const maxY = Math.max(...mapData.nodes.map((n: any) => n.y));
  const width = (maxX + 1) * SPACING + 100;
  const height = (maxY + 1) * SPACING + 100;

  const handleNodeClick = (nodeId: string) => {
    if (!canPlay) return;
    if (phase === 'placement') {
      // 돌 놓기
      onPlaceStone(nodeId);
    } else if (phase === 'movement') {
      // 돌 이동 (두 번 클릭)
      if (!selectedNode) {
        // 첫 클릭 -> fromNode 선택
        // occupant[fromNode] == 내 돌인지 체크
        const myStone = game.player1_id === user?.id ? 1 : 2;
        console.log(selectedNode, nodeId, occupant[nodeId], myStone);
        if (occupant[nodeId] === myStone) {
          setSelectedNode(nodeId);
        } else {
          console.log(selectedNode, nodeId, occupant[nodeId], myStone);
          alert('자신의 돌이 있는 곳을 선택하세요.');
        }
      } else {
        // 두 번째 클릭 -> toNode
        if (selectedNode === nodeId) {
          // 취소
          setSelectedNode(null);
        } else {
          onMoveStone(selectedNode, nodeId);
          setSelectedNode(null);
        }
      }
    }
  };

  return (
    <div
      className="relative mx-auto bg-gray-50 rounded"
      style={{ width, height }}
    >
      {/* Edges */}
      {mapData.edges.map((edge: any, idx: number) => {
        const [startId, endId] = edge;
        const startNode = mapData.nodes.find((n: any) => n.id === startId);
        const endNode = mapData.nodes.find((n: any) => n.id === endId);
        if (!startNode || !endNode) return null;

        const x1 = startNode.x * SPACING + 50;
        const y1 = startNode.y * SPACING + 50;
        const x2 = endNode.x * SPACING + 50;
        const y2 = endNode.y * SPACING + 50;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <div
            key={`edge-${idx}`}
            style={{
              position: 'absolute',
              left: x1,
              top: y1,
              width: length,
              height: 2,
              backgroundColor: '#999',
              transform: `rotate(${angle}deg)`,
              transformOrigin: '0 50%',
            }}
          />
        );
      })}

      {/* Nodes */}
      {mapData.nodes.map((node: any) => {
        const px = node.x * SPACING + 50;
        const invertedY = maxY - node.y;
        const py = invertedY * SPACING + 50;

        // occupant[node.id] = 0,1,2
        const cellValue = occupant[node.id] || 0;

        return (
          <button
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            disabled={!canPlay}
            style={{
              position: 'absolute',
              left: px - 15,
              top: py - 15,
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '2px solid #ccc',
              backgroundColor:
                cellValue === 1
                  ? 'black'
                  : cellValue === 2
                  ? 'white'
                  : 'transparent',
              boxShadow: cellValue === 2 ? 'inset 0 0 0 2px black' : 'none',
              cursor: canPlay? 'pointer' : 'default',
            }}
          />
        );
      })}
    </div>
  );
};
