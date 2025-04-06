import { Game } from "../types/game";

export interface GameLogic {
  canPlaceStone(
    nodeId: string,
    game: Game,
    userId: string
  ): { valid: boolean; message?: string };
  placeStone(nodeId: string, game: Game, userId: string): Game["game_state"];
  canMoveStone(
    fromNode: string,
    toNode: string,
    game: Game,
    userId: string
  ): { valid: boolean; message?: string };
  moveStone(fromNode: string, toNode: string, game: Game, userId: string): Game["game_state"];
  checkWinCondition(gameState: Game["game_state"], playerStone: number,edges: [string, string][] ): boolean;
}