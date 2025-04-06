// src/gameLogic/factory.ts
import { GameLogic } from './types';
import { SabangLogic } from './sabang';
import { UmulLogic } from './umul';
import { HobakLogic } from './hobak';

export function createGameLogic(mapName: string): GameLogic {
  switch (mapName) {
    case '사방고누':
      return new SabangLogic();
    case '우물고누':
      return new UmulLogic();
    case '호박고누':
      return new HobakLogic();
    default:
      throw new Error(`알 수 없는 게임 맵: ${mapName}`);
  }
}
