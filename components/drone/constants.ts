import { Level } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const GRAVITY = 0.08;
export const THRUST = 0.2;
export const FRICTION = 0.98;

export const SKINS = {
  default: { name: 'Standard Issue', color: '#94a3b8', highlight: '#cbd5e1', dark: '#64748b', cost: 0 },
  crimson: { name: 'Crimson Fury', color: '#ef4444', highlight: '#f87171', dark: '#b91c1c', cost: 1000 },
  neon: { name: 'Neon Strike', color: '#10b981', highlight: '#34d399', dark: '#047857', cost: 2000 },
  gold: { name: 'Royal Gold', color: '#eab308', highlight: '#facc15', dark: '#a16207', cost: 5000 },
  void: { name: 'Void Walker', color: '#8b5cf6', highlight: '#a78bfa', dark: '#5b21b6', cost: 10000 },
} as const;

export type SkinId = keyof typeof SKINS;

export const LEVELS: Level[] = [
  {
    name: "First Flight",
    start: { x: 50, y: 50 },
    pad: { x: 700, y: 550, w: 80, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [],
    powerups: [],
    fuel: 1000,
    parTime: 10
  },
  {
    name: "The Blockade",
    start: { x: 50, y: 50 },
    pad: { x: 700, y: 550, w: 80, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 350, y: 200, w: 50, h: 400 },
      { x: 500, y: 100, w: 30, h: 30, type: 'mine' },
      { x: 550, y: 450, w: 30, h: 30, type: 'mine' }
    ],
    powerups: [
      { x: 355, y: 150, type: 'fuel' }
    ],
    fuel: 1200,
    parTime: 15
  },
  {
    name: "The Cave",
    start: { x: 50, y: 300 },
    pad: { x: 700, y: 300, w: 80, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 0, y: 0, w: 800, h: 150 },
      { x: 0, y: 450, w: 800, h: 150 },
      { x: 300, y: 150, w: 50, h: 150 },
      { x: 550, y: 150, w: 20, h: 300, type: 'laser', laserOnDuration: 2.5, laserOffDuration: 1.5 }
    ],
    powerups: [
      { x: 400, y: 300, type: 'shield' }
    ],
    fuel: 1500,
    parTime: 20
  },
  {
    name: "Moving Gates",
    start: { x: 50, y: 300 },
    pad: { x: 700, y: 300, w: 80, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 350, y: 0, w: 50, h: 200 },
      { x: 350, y: 400, w: 50, h: 200 },
      { x: 500, y: 200, w: 50, h: 150, isMoving: true, moveAxis: 'y', moveRange: 120, moveSpeed: 2, baseY: 225 }
    ],
    powerups: [
      { x: 430, y: 300, type: 'fuel' }
    ],
    fuel: 1500,
    parTime: 25
  },
  {
    name: "Crosswind Gauntlet",
    start: { x: 50, y: 50 },
    pad: { x: 700, y: 550, w: 60, h: 10 },
    wind: { x: 0.05, y: 0 },
    obstacles: [
      { x: 200, y: 0, w: 50, h: 350 },
      { x: 450, y: 250, w: 50, h: 350 },
      { x: 600, y: 0, w: 30, h: 200, isMoving: true, moveAxis: 'y', moveRange: 150, moveSpeed: 3, baseY: 100 }
    ],
    powerups: [
      { x: 325, y: 450, type: 'shield' },
      { x: 525, y: 100, type: 'fuel' }
    ],
    fuel: 2000,
    parTime: 30
  },
  {
    name: "The Squeeze",
    start: { x: 50, y: 300 },
    pad: { x: 700, y: 300, w: 60, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 0, y: 0, w: 800, h: 250 },
      { x: 0, y: 350, w: 800, h: 250 }
    ],
    powerups: [
      { x: 400, y: 280, type: 'fuel' }
    ],
    fuel: 1200,
    parTime: 15
  },
  {
    name: "Updraft",
    start: { x: 50, y: 50 },
    pad: { x: 700, y: 550, w: 60, h: 10 },
    wind: { x: 0, y: -0.05 },
    obstacles: [
      { x: 200, y: 150, w: 100, h: 20 },
      { x: 400, y: 350, w: 100, h: 20 },
      { x: 600, y: 150, w: 100, h: 20 }
    ],
    powerups: [
      { x: 240, y: 120, type: 'shield' }
    ],
    fuel: 1500,
    parTime: 20
  },
  {
    name: "Piston Chamber",
    start: { x: 50, y: 300 },
    pad: { x: 700, y: 300, w: 60, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 200, y: 0, w: 50, h: 200, isMoving: true, moveAxis: 'y', moveRange: 100, moveSpeed: 2, baseY: 100 },
      { x: 400, y: 400, w: 50, h: 200, isMoving: true, moveAxis: 'y', moveRange: 100, moveSpeed: 2.5, baseY: 500 },
      { x: 600, y: 0, w: 50, h: 200, isMoving: true, moveAxis: 'y', moveRange: 100, moveSpeed: 3, baseY: 100 }
    ],
    powerups: [
      { x: 300, y: 300, type: 'fuel' },
      { x: 500, y: 300, type: 'shield' }
    ],
    fuel: 1800,
    parTime: 25
  },
  {
    name: "Wind Tunnel",
    start: { x: 50, y: 300 },
    pad: { x: 700, y: 300, w: 60, h: 10 },
    wind: { x: 0.08, y: 0 },
    obstacles: [
      { x: 200, y: 0, w: 40, h: 250 },
      { x: 200, y: 350, w: 40, h: 250 },
      { x: 450, y: 0, w: 40, h: 200 },
      { x: 450, y: 400, w: 40, h: 200 }
    ],
    powerups: [
      { x: 325, y: 300, type: 'fuel' }
    ],
    fuel: 1500,
    parTime: 20
  },
  {
    name: "The Zig Zag",
    start: { x: 50, y: 50 },
    pad: { x: 700, y: 550, w: 60, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 0, y: 150, w: 600, h: 50 },
      { x: 200, y: 350, w: 600, h: 50 }
    ],
    powerups: [
      { x: 700, y: 250, type: 'shield' },
      { x: 100, y: 450, type: 'fuel' }
    ],
    fuel: 2000,
    parTime: 30
  },
  {
    name: "Double Trouble",
    start: { x: 50, y: 300 },
    pad: { x: 700, y: 300, w: 60, h: 10 },
    wind: { x: 0.05, y: 0 },
    obstacles: [
      { x: 300, y: 0, w: 50, h: 200, isMoving: true, moveAxis: 'y', moveRange: 150, moveSpeed: 2, baseY: 150 },
      { x: 300, y: 400, w: 50, h: 200, isMoving: true, moveAxis: 'y', moveRange: 150, moveSpeed: 2, baseY: 450 },
      { x: 500, y: 0, w: 50, h: 200, isMoving: true, moveAxis: 'y', moveRange: 150, moveSpeed: 2.5, baseY: 150 },
      { x: 500, y: 400, w: 50, h: 200, isMoving: true, moveAxis: 'y', moveRange: 150, moveSpeed: 2.5, baseY: 450 }
    ],
    powerups: [
      { x: 400, y: 300, type: 'fuel' }
    ],
    fuel: 2000,
    parTime: 25
  },
  {
    name: "Freefall",
    start: { x: 50, y: 50 },
    pad: { x: 400, y: 550, w: 60, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 0, y: 200, w: 350, h: 20 },
      { x: 450, y: 200, w: 350, h: 20 },
      { x: 0, y: 400, w: 250, h: 20 },
      { x: 550, y: 400, w: 250, h: 20 }
    ],
    powerups: [
      { x: 390, y: 300, type: 'shield' }
    ],
    fuel: 800,
    parTime: 15
  },
  {
    name: "The Maze",
    start: { x: 50, y: 50 },
    pad: { x: 700, y: 50, w: 60, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 150, y: 0, w: 20, h: 450 },
      { x: 300, y: 150, w: 20, h: 450 },
      { x: 450, y: 0, w: 20, h: 450 },
      { x: 600, y: 150, w: 20, h: 450 }
    ],
    powerups: [
      { x: 225, y: 500, type: 'fuel' },
      { x: 525, y: 500, type: 'fuel' }
    ],
    fuel: 3000,
    parTime: 40
  },
  {
    name: "The Barrier Reef",
    start: { x: 50, y: 300 },
    pad: { x: 700, y: 300, w: 80, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 200, y: 150, w: 20, h: 300, type: 'barrier' },
      { x: 400, y: 150, w: 20, h: 300, type: 'barrier' },
      { x: 600, y: 150, w: 20, h: 300, type: 'barrier' }
    ],
    powerups: [
      { x: 100, y: 300, type: 'fuel' }
    ],
    fuel: 2000,
    parTime: 25
  },
  {
    name: "Hurricane",
    start: { x: 50, y: 50 },
    pad: { x: 700, y: 550, w: 60, h: 10 },
    wind: { x: 0.08, y: 0.04 },
    obstacles: [
      { x: 200, y: 200, w: 50, h: 50, isMoving: true, moveAxis: 'x', moveRange: 100, moveSpeed: 4, baseY: 200, baseX: 200 },
      { x: 400, y: 400, w: 50, h: 50, isMoving: true, moveAxis: 'x', moveRange: 100, moveSpeed: 5, baseY: 400, baseX: 400 },
      { x: 600, y: 200, w: 50, h: 50, isMoving: true, moveAxis: 'y', moveRange: 150, moveSpeed: 3, baseY: 200, baseX: 600 },
      { x: 300, y: 100, w: 25, h: 25, type: 'mine' },
      { x: 500, y: 500, w: 25, h: 25, type: 'mine' },
      { x: 100, y: 100, w: 40, h: 40, type: 'searchlight', range: 300, rotation: Math.PI / 4 }
    ],
    powerups: [
      { x: 300, y: 300, type: 'shield' },
      { x: 500, y: 300, type: 'fuel' }
    ],
    fuel: 2500,
    parTime: 35
  },
  {
    name: "The Final Gauntlet",
    start: { x: 50, y: 50 },
    pad: { x: 700, y: 550, w: 40, h: 10 },
    wind: { x: 0.06, y: -0.02 },
    obstacles: [
      { x: 150, y: 0, w: 30, h: 300 },
      { x: 150, y: 400, w: 30, h: 200 },
      { x: 350, y: 100, w: 30, h: 500 },
      { x: 550, y: 0, w: 30, h: 200 },
      { x: 550, y: 300, w: 30, h: 150 },
      { x: 550, y: 550, w: 30, h: 50 },
      { x: 250, y: 250, w: 20, h: 20, isMoving: true, moveAxis: 'y', moveRange: 200, moveSpeed: 4, baseY: 250 },
      { x: 450, y: 350, w: 20, h: 20, isMoving: true, moveAxis: 'y', moveRange: 200, moveSpeed: 5, baseY: 350 },
      { x: 650, y: 200, w: 20, h: 300, type: 'laser', laserOnDuration: 1.5, laserOffDuration: 1.5 }
    ],
    powerups: [
      { x: 250, y: 50, type: 'shield' },
      { x: 450, y: 550, type: 'fuel' },
      { x: 650, y: 250, type: 'shield' }
    ],
    fuel: 3500,
    parTime: 45
  },
  {
    name: "Magnetic Field",
    start: { x: 50, y: 300 },
    pad: { x: 700, y: 300, w: 80, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 400, y: 300, w: 40, h: 40, type: 'magnet', strength: 0.3, range: 250 },
      { x: 200, y: 100, w: 30, h: 30, type: 'mine' },
      { x: 200, y: 500, w: 30, h: 30, type: 'mine' },
      { x: 600, y: 100, w: 30, h: 30, type: 'mine' },
      { x: 600, y: 500, w: 30, h: 30, type: 'mine' }
    ],
    powerups: [
      { x: 400, y: 100, type: 'slowmo' }
    ],
    fuel: 2000,
    parTime: 20
  },
  {
    name: "Stealth Mission",
    start: { x: 50, y: 50 },
    pad: { x: 700, y: 550, w: 60, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 300, y: 100, w: 40, h: 40, type: 'searchlight', range: 350, rotation: 0 },
      { x: 500, y: 400, w: 40, h: 40, type: 'searchlight', range: 350, rotation: Math.PI },
      { x: 0, y: 250, w: 600, h: 20 },
      { x: 200, y: 450, w: 600, h: 20 }
    ],
    powerups: [
      { x: 400, y: 300, type: 'fuel' },
      { x: 100, y: 500, type: 'shield' }
    ],
    fuel: 2500,
    parTime: 30
  },
  {
    name: "The Vortex",
    start: { x: 400, y: 50 },
    pad: { x: 400, y: 550, w: 60, h: 10 },
    wind: { x: 0, y: 0 },
    obstacles: [
      { x: 400, y: 300, w: 40, h: 40, type: 'magnet', strength: -0.4, range: 300 },
      { x: 100, y: 300, w: 100, h: 100, type: 'wind', strength: 0.5 },
      { x: 600, y: 300, w: 100, h: 100, type: 'wind', strength: -0.5 },
      { x: 200, y: 100, w: 20, h: 400, type: 'laser', laserOnDuration: 1, laserOffDuration: 1 },
      { x: 580, y: 100, w: 20, h: 400, type: 'laser', laserOnDuration: 1, laserOffDuration: 1 },
      { x: 400, y: 50, w: 40, h: 40, type: 'searchlight', range: 400, rotation: Math.PI / 2 }
    ],
    powerups: [
      { x: 400, y: 300, type: 'slowmo' }
    ],
    fuel: 3000,
    parTime: 40
  },
  {
    name: "Endless Void",
    start: { x: 400, y: 300 },
    pad: { x: -100, y: -100, w: 0, h: 0 },
    wind: { x: 0, y: 0 },
    obstacles: [],
    powerups: [],
    fuel: 5000,
    parTime: 999,
    isEndless: true
  }
];
