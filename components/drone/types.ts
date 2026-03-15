export type Obstacle = {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'wall' | 'mine' | 'laser' | 'missile' | 'barrier' | 'wind' | 'magnet' | 'searchlight';
  isMoving?: boolean;
  moveAxis?: 'x' | 'y';
  moveRange?: number;
  moveSpeed?: number;
  baseX?: number;
  baseY?: number;
  currentX?: number;
  currentY?: number;
  laserState?: 'on' | 'off';
  laserTimer?: number;
  laserOnDuration?: number;
  laserOffDuration?: number;
  vx?: number;
  vy?: number;
  isDestroyed?: boolean;
  health?: number;
  angle?: number;
  strength?: number;
  range?: number;
  rotation?: number;
};

export type Powerup = {
  x: number;
  y: number;
  type: 'fuel' | 'shield' | 'slowmo';
  collected?: boolean;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'smoke' | 'spark' | 'explosion' | 'dust';
};

export type Level = {
  name: string;
  start: { x: number; y: number };
  pad: { x: number; y: number; w: number; h: number };
  wind: { x: number; y: number };
  obstacles: Obstacle[];
  powerups: Powerup[];
  fuel: number;
  parTime: number; // in seconds
  isEndless?: boolean;
};

export type DroneMods = {
  engine: number; // multiplier for thrust
  battery: number; // multiplier for max fuel
  armor: number; // number of free collisions
  magnet?: number; // magnet strength
};
