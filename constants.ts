import { LevelData, Position } from './types';

export const GRID_SIZE = 5;

export const INITIAL_LEVEL: LevelData = {
  id: 1,
  gridSize: GRID_SIZE,
  start: { x: 0, y: 0 },
  goal: { x: 3, y: 0 },
  obstacles: [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ],
  theme: 'park',
  story: 'Help Robo get to the magical star! Watch out for the bushes.'
};

export const FALLBACK_LEVEL: LevelData = {
  id: 99,
  gridSize: GRID_SIZE,
  start: { x: 0, y: 4 },
  goal: { x: 4, y: 0 },
  obstacles: [
    { x: 1, y: 3 },
    { x: 2, y: 2 },
    { x: 3, y: 1 },
  ],
  theme: 'space',
  story: 'Robo is in space! Navigate through the asteroids to reach the energy core.'
};