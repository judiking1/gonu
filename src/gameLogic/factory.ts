// src/gameLogic/factory.ts
import { GameLogic } from './types';
import { SabangLogic } from './sabang';
import { Game } from '../types/game';

export function createGameLogic(mapName: string): GameLogic {
  switch (mapName) {
    case '사방고누':
      return new SabangLogic();
    case '우물고누':
      return new class implements GameLogic {
        canPlaceStone() {
          return { valid: false, message: '우물고누는 아직 구현되지 않았습니다.' };
        }
        placeStone(_nodeId: string, game: Game): Game["game_state"] {
          return game.game_state; // 기본 상태 반환
        }
        canMoveStone() {
          return { valid: false, message: '우물고누는 아직 구현되지 않았습니다.' };
        }
        moveStone(_fromNode: string, _toNode: string, game: Game): Game["game_state"] {
          return game.game_state; // 기본 상태 반환
        }
        checkWinCondition() {
          return false;
        }
      }();
    case '호박고누':
      return new class implements GameLogic {
        canPlaceStone() {
          return { valid: false, message: '호박고누는 아직 구현되지 않았습니다.' };
        }
        placeStone(_nodeId: string, game: Game): Game["game_state"] {
          return game.game_state; // 기본 상태 반환
        }
        canMoveStone() {
          return { valid: false, message: '호박고누는 아직 구현되지 않았습니다.' };
        }
        moveStone(_fromNode: string, _toNode: string, game: Game): Game["game_state"] {
          return game.game_state; // 기본 상태 반환
        }
        checkWinCondition() {
          return false;
        }
      }();
    default:
      throw new Error(`알 수 없는 게임 맵: ${mapName}`);
  }
}