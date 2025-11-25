export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface LevelData {
  id: number;
  gridSize: number;
  start: Position;
  goal: Position;
  obstacles: Position[];
  theme: string;
  story: string;
}

export type GameStatus = 'IDLE' | 'RUNNING' | 'WON' | 'LOST';

export interface GridCell {
  x: number;
  y: number;
  hasPlayer: boolean;
  hasGoal: boolean;
  isObstacle: boolean;
}