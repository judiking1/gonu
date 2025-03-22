// 각 위치 상태 정의
export type Player = 'player1' | 'player2' | null;

export interface Board {
  [position: string]: Player;
}

// 기본 3x3 밭고누 초기 상태
export const initialBoard: Board = {
  '0,0': 'player1', '0,1': 'player1', '0,2': 'player1',
  '1,0': null,      '1,1': null,      '1,2': null,
  '2,0': 'player2', '2,1': 'player2', '2,2': 'player2',
};

// 위치별 인접 위치 정의 (이동 가능한 방향)
export const moves: Record<string, string[]> = {
  '0,0': ['0,1', '1,0', '1,1'],
  '0,1': ['0,0', '0,2', '1,1'],
  '0,2': ['0,1', '1,1', '1,2'],
  '1,0': ['0,0', '1,1', '2,0'],
  '1,1': ['0,0', '0,1', '0,2', '1,0', '1,2', '2,0', '2,1', '2,2'],
  '1,2': ['0,2', '1,1', '2,2'],
  '2,0': ['1,0', '1,1', '2,1'],
  '2,1': ['2,0', '1,1', '2,2'],
  '2,2': ['2,1', '1,1', '1,2'],
};
