// src/components/game/GameBoard.tsx
import React from 'react';
import type { Game } from '../../types/game';

interface GameBoardProps {
  game: Game;
  user: { id: string } | null;
  onNodeClick: (nodeId: string) => void;
  selectedNode: string | null; // 선택된 노드 표시용
}

export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  user,
  onNodeClick,
  selectedNode,
}) => {
  const isMyTurn = game.current_turn === user?.id;
  const canPlay = game.status === 'playing' && isMyTurn;
  const mapData = game.game_maps?.map_data;
  const occupant = game.game_state.occupant;

  if (!mapData || !mapData.nodes || !mapData.edges) {
    return <div>맵 데이터가 없습니다.</div>;
  }
  if (!occupant) {
    return <div>돌 상태(occupant)가 없습니다.</div>;
  }

  const SPACING = 100;
  const maxX = Math.max(...mapData.nodes.map((n: any) => n.x));
  const maxY = Math.max(...mapData.nodes.map((n: any) => n.y));
  const width = (maxX + 1) * SPACING + 100;
  const height = (maxY + 1) * SPACING + 100;

  return (
    <div className="relative mx-auto bg-gray-50 rounded" style={{ width, height }}>
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
        const cellValue = occupant[node.id] || 0;
        const isSelected = selectedNode === node.id;

        return (
          <button
            key={node.id}
            onClick={() => onNodeClick(node.id)}
            disabled={!canPlay}
            style={{
              position: 'absolute',
              left: px - 15,
              top: py - 15,
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: `2px solid ${isSelected ? '#ff0000' : '#ccc'}`,
              backgroundColor:
                cellValue === 1 ? 'black' : cellValue === 2 ? 'white' : 'transparent',
              boxShadow: cellValue === 2 ? 'inset 0 0 0 2px black' : 'none',
              cursor: canPlay ? 'pointer' : 'default',
            }}
          />
        );
      })}
    </div>
  );
};