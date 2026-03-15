'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, ArrowRight, ArrowUp, ArrowDown, ArrowLeft, Trophy, Zap, Wrench, Battery, Shield, Clock, Timer, Target, Magnet, ChevronRight, Settings, Info } from 'lucide-react';

import { SoundEngine } from './drone/SoundEngine';
import { Obstacle, Powerup, Particle, Level, DroneMods } from './drone/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, THRUST, FRICTION, SKINS, SkinId, LEVELS } from './drone/constants';
import { checkCollision } from './drone/utils';

export default function DroneGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'shop' | 'playing' | 'gameover' | 'levelcomplete' | 'won'>('menu');
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [missileDestroyedCount, setMissileDestroyedCount] = useState(0);
  const [landingAccuracy, setLandingAccuracy] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [fuel, setFuel] = useState(0);
  const [armorHits, setArmorHits] = useState(0);
  const [pulseCooldown, setPulseCooldown] = useState(0);
  const [mods, setMods] = useState<DroneMods>({ engine: 1, battery: 1, armor: 0, magnet: 0 });
  const [equippedSkin, setEquippedSkin] = useState<SkinId>('default');
  const [unlockedSkins, setUnlockedSkins] = useState<SkinId[]>(['default']);
  const [levelStartTime, setLevelStartTime] = useState(0);
  const [levelTime, setLevelTime] = useState(0);
  const [shake, setShake] = useState(0);
  const [slowmo, setSlowmo] = useState(0);
  const [medals, setMedals] = useState<Record<number, { time: boolean; fuel: boolean; accuracy: boolean }>>({});
  const [badgeInfo, setBadgeInfo] = useState<string | null>(null);
  const [isCRT, setIsCRT] = useState(true);

  const gameStateRef = useRef(gameState);
  const levelIndexRef = useRef(levelIndex);
  const skinRef = useRef(equippedSkin);
  const modsRef = useRef(mods);
  const levelStartTimeRef = useRef(0);
  const levelTimeRef = useRef(0);
  const scoreAtLevelStartRef = useRef(0);
  const soundRef = useRef<SoundEngine | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const shakeRef = useRef(0);
  const slowmoRef = useRef(0);

  useEffect(() => {
    soundRef.current = new SoundEngine();
    return () => {
      if (soundRef.current?.ctx) {
        soundRef.current.ctx.close();
      }
    };
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
    levelIndexRef.current = levelIndex;
    modsRef.current = mods;
    skinRef.current = equippedSkin;

    if (gameState === 'playing') {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [gameState, levelIndex, mods, equippedSkin]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  const droneRef = useRef({ 
    x: 50, y: 50, w: 24, h: 24, vx: 0, vy: 0, 
    fuel: 1000, shieldActive: false, armorHits: 0,
    pulseCooldown: 0, pulseActive: false, pulseRadius: 0,
    tilt: 0
  });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const powerupsRef = useRef<Powerup[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);

  const resetDrone = () => {
    const level = LEVELS[levelIndexRef.current];
    const maxFuel = level.fuel * modsRef.current.battery;
    droneRef.current = { 
      x: level.start.x, 
      y: level.start.y, 
      w: 24, 
      h: 24, 
      vx: 0, 
      vy: 0, 
      fuel: maxFuel,
      shieldActive: false,
      armorHits: modsRef.current.armor,
      pulseCooldown: 0,
      pulseActive: false,
      pulseRadius: 0,
      tilt: 0
    };
    powerupsRef.current = JSON.parse(JSON.stringify(level.powerups)).map((p: any) => ({
      ...p,
      x: p.x + (Math.random() - 0.5) * 40,
      y: p.y + (Math.random() - 0.5) * 40
    }));
    obstaclesRef.current = JSON.parse(JSON.stringify(level.obstacles)).map((o: any) => {
      const dx = (Math.random() - 0.5) * 40;
      const dy = (Math.random() - 0.5) * 40;
      return {
        ...o,
        x: o.x + dx,
        y: o.y + dy,
        baseX: o.baseX !== undefined ? (o.baseX + dx) : undefined,
        baseY: o.baseY !== undefined ? (o.baseY + dy) : undefined
      };
    });
    particlesRef.current = [];
    shakeRef.current = 0;
    setShake(0);
    slowmoRef.current = 0;
    setSlowmo(0);
    const now = Date.now();
    setLevelStartTime(now);
    levelStartTimeRef.current = now;
    setLevelTime(0);
    levelTimeRef.current = 0;
    setMissileDestroyedCount(0);
  };

  const createParticles = (x: number, y: number, color: string, count: number, type: Particle['type'] = 'smoke') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: Math.random() * 0.5 + 0.5,
        color,
        size: Math.random() * 4 + 2,
        type
      });
    }
  };

  const addShake = (amount: number) => {
    shakeRef.current = Math.min(shakeRef.current + amount, 20);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const update = (time: number) => {
    if (gameStateRef.current !== 'playing') return;

    // Slowmo logic
    if (slowmoRef.current > 0) {
      slowmoRef.current -= 1/60;
      setSlowmo(Math.max(0, slowmoRef.current));
    }
    const timeScale = slowmoRef.current > 0 ? 0.4 : 1;

    const drone = droneRef.current;
    const keys = keysRef.current;
    const level = LEVELS[levelIndexRef.current];
    const currentMods = modsRef.current;

    // Time tracking
    const currentTime = (Date.now() - levelStartTimeRef.current) / 1000;
    setLevelTime(currentTime);
    levelTimeRef.current = currentTime;

    // Shake decay
    if (shakeRef.current > 0) {
      shakeRef.current *= 0.9;
      if (shakeRef.current < 0.1) shakeRef.current = 0;
      setShake(shakeRef.current);
    }

    // Physics & Dynamic Wind
    const windFluctuation = Math.sin(time / 2000) * 0.05;
    const currentWindX = (level.wind.x + windFluctuation) * timeScale;
    const currentWindY = (level.wind.y + (Math.cos(time / 3000) * 0.03)) * timeScale;

    drone.vy += GRAVITY * timeScale;
    drone.vx += currentWindX;
    drone.vy += currentWindY;

    // Apply Wind/Magnet Obstacles
    obstaclesRef.current.forEach(obs => {
      if (obs.type === 'wind') {
        const dx = (drone.x + drone.w/2) - (obs.x + obs.w/2);
        const dy = (drone.y + drone.h/2) - (obs.y + obs.h/2);
        if (Math.abs(dx) < obs.w/2 && Math.abs(dy) < obs.h/2) {
          drone.vx += (obs.strength || 0.1) * timeScale;
        }
      } else if (obs.type === 'magnet') {
        const dx = (obs.x + obs.w/2) - (drone.x + drone.w/2);
        const dy = (obs.y + obs.h/2) - (drone.y + drone.h/2);
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < (obs.range || 200)) {
          // Reduced magnet effect by multiplying by 0.35
          const force = (obs.strength || 0.2) * 0.35 * (1 - dist / (obs.range || 200)) * timeScale;
          drone.vx += (dx / dist) * force;
          drone.vy += (dy / dist) * force;
        }
      } else if (obs.type === 'searchlight') {
        obs.rotation = (obs.rotation || 0) + 0.02 * timeScale;
        const beamAngle = obs.rotation;
        const dx = (drone.x + drone.w/2) - (obs.x + obs.w/2);
        const dy = (drone.y + drone.h/2) - (obs.y + obs.h/2);
        const dist = Math.sqrt(dx*dx + dy*dy);
        const angleToDrone = Math.atan2(dy, dx);
        let diff = Math.abs(beamAngle - angleToDrone);
        while (diff > Math.PI) diff -= Math.PI * 2;
        diff = Math.abs(diff);
        
        if (dist < (obs.range || 300) && diff < 0.2) {
          // Detected! Spawn missile
          if (Math.random() < 0.05) {
            obstaclesRef.current.push({
              x: obs.x + obs.w/2, y: obs.y + obs.h/2, w: 16, h: 16, type: 'missile', vx: 0, vy: 0, angle: 0
            });
          }
        }
      }
    });

    let isThrusting = false;
    const effectiveThrust = THRUST * currentMods.engine * timeScale;
    
    if (drone.fuel > 0) {
      if (keys.ArrowUp || keys.w) { 
        drone.vy -= effectiveThrust; drone.fuel -= 2; isThrusting = true; 
      }
      if (keys.ArrowDown || keys.s) { drone.vy += effectiveThrust * 0.5; drone.fuel -= 1; isThrusting = true; }
      if (keys.ArrowLeft || keys.a) { 
        drone.vx -= effectiveThrust * 0.8; drone.fuel -= 1.5; isThrusting = true; 
        drone.tilt = Math.max(drone.tilt - 0.05, -0.3);
      }
      if (keys.ArrowRight || keys.d) { 
        drone.vx += effectiveThrust * 0.8; drone.fuel -= 1.5; isThrusting = true; 
        drone.tilt = Math.min(drone.tilt + 0.05, 0.3);
      }
      
      // Pulse mechanic
      if (keys[' '] && drone.pulseCooldown <= 0 && drone.fuel >= 100) {
        drone.pulseActive = true;
        drone.pulseRadius = 0;
        drone.pulseCooldown = 120; // 2 seconds at 60fps
        drone.fuel -= 100;
        soundRef.current?.playPowerup();
        addShake(5);
      }
    }

    if (!keys.ArrowLeft && !keys.a && !keys.ArrowRight && !keys.d) {
      drone.tilt *= 0.9;
    }

    if (drone.pulseActive) {
      drone.pulseRadius += 8 * timeScale;
      if (drone.pulseRadius > 180) {
        drone.pulseActive = false;
        drone.pulseRadius = 0;
      }
    }

    if (drone.pulseCooldown > 0) drone.pulseCooldown--;
    
    soundRef.current?.setThrust(isThrusting);

    if (drone.fuel < 0) drone.fuel = 0;

    drone.vx *= FRICTION;
    drone.vy *= FRICTION;

    drone.x += drone.vx * timeScale;
    drone.y += drone.vy * timeScale;

    // Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      p.life -= (1 / 60) / p.maxLife * timeScale;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Random Obstacle Spawning
    if (Math.random() < 0.003 * timeScale) { // Occasional random missile
      const side = Math.floor(Math.random() * 4);
      let mx, my;
      if (side === 0) { mx = Math.random() * CANVAS_WIDTH; my = -20; }
      else if (side === 1) { mx = CANVAS_WIDTH + 20; my = Math.random() * CANVAS_HEIGHT; }
      else if (side === 2) { mx = Math.random() * CANVAS_WIDTH; my = CANVAS_HEIGHT + 20; }
      else { mx = -20; my = Math.random() * CANVAS_HEIGHT; }
      
      obstaclesRef.current.push({
        x: mx, y: my, w: 16, h: 16, type: 'missile', vx: 0, vy: 0, angle: 0
      });
    }

    // Powerup collision
    powerupsRef.current.forEach(p => {
      if (!p.collected) {
        // Magnet attraction
        if (modsRef.current.magnet && modsRef.current.magnet > 0) {
          const dx = (drone.x + drone.w/2) - (p.x + 10);
          const dy = (drone.y + drone.h/2) - (p.y + 10);
          const dist = Math.sqrt(dx*dx + dy*dy);
          const magnetRange = modsRef.current.magnet * 200;
          if (dist < magnetRange) {
            const force = (modsRef.current.magnet * 0.5) * (1 - dist / magnetRange) * timeScale;
            // Reduced magnet pull force on powerups
            p.x += (dx / dist) * force * 4;
            p.y += (dy / dist) * force * 4;
          }
        }
        
        if (checkCollision(drone, { x: p.x, y: p.y, w: 20, h: 20 })) {
          p.collected = true;
          soundRef.current?.playPowerup();
          if (p.type === 'fuel') {
            drone.fuel = Math.min(drone.fuel + 500, level.fuel * currentMods.battery);
            createParticles(p.x + 10, p.y + 10, '#f59e0b', 10, 'spark');
          } else if (p.type === 'shield') {
            drone.shieldActive = true;
            createParticles(p.x + 10, p.y + 10, '#3b82f6', 10, 'spark');
          } else if (p.type === 'slowmo') {
            slowmoRef.current = 5;
            setSlowmo(5);
            createParticles(p.x + 10, p.y + 10, '#8b5cf6', 10, 'spark');
          }
        }
      }
    });

    const handleCrash = (ignoreArmor = false) => {
      addShake(8);
      createParticles(drone.x + drone.w/2, drone.y + drone.h/2, '#ef4444', 15, 'explosion');
      if (drone.shieldActive) {
        drone.shieldActive = false;
        drone.vx *= -0.5;
        drone.vy *= -0.5;
        soundRef.current?.playCrash();
        return false;
      } else if (!ignoreArmor && drone.armorHits > 0) {
        drone.armorHits--;
        drone.vx *= -0.5;
        drone.vy *= -0.5;
        soundRef.current?.playCrash();
        return false;
      }
      return true;
    };

    // Boundary collision
    if (drone.x < 0 || drone.x + drone.w > CANVAS_WIDTH || drone.y < 0 || drone.y + drone.h > CANVAS_HEIGHT) {
      if (handleCrash()) {
        soundRef.current?.playCrash();
        setGameState('gameover');
        return;
      } else {
        drone.x = Math.max(0, Math.min(drone.x, CANVAS_WIDTH - drone.w));
        drone.y = Math.max(0, Math.min(drone.y, CANVAS_HEIGHT - drone.h));
      }
    }

    // Obstacle logic & collision
    let crashed = false;
    let crashedByMissile = false;
    obstaclesRef.current = obstaclesRef.current.filter(obs => !obs.isDestroyed);
    
    obstaclesRef.current.forEach(obs => {
      let currentX = obs.x;
      let currentY = obs.y;

      if (obs.isMoving) {
        const t = time / 1000;
        if (obs.moveAxis === 'y') {
          currentY = (obs.baseY || 0) + Math.sin(t * (obs.moveSpeed || 1)) * (obs.moveRange || 0);
        } else {
          currentX = (obs.baseX || 0) + Math.sin(t * (obs.moveSpeed || 1)) * (obs.moveRange || 0);
        }
      }

      if (obs.type === 'missile' || obs.type === 'mine') {
        const dx = (drone.x + drone.w/2) - (obs.x + obs.w/2);
        const dy = (drone.y + drone.h/2) - (obs.y + obs.h/2);
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (obs.type === 'missile') {
          obs.vx = (obs.vx || 0) * 0.95 + (dx / dist) * 0.15;
          obs.vy = (obs.vy || 0) * 0.95 + (dy / dist) * 0.15;
          
          obs.x += obs.vx;
          obs.y += obs.vy;
          obs.angle = Math.atan2(obs.vy, obs.vx);
        }
        
        currentX = obs.x;
        currentY = obs.y;

        if (drone.pulseActive) {
          const pdx = (obs.x + obs.w/2) - (drone.x + drone.w/2);
          const pdy = (obs.y + obs.h/2) - (drone.y + drone.h/2);
          const pdist = Math.sqrt(pdx*pdx + pdy*pdy);
          if (pdist < drone.pulseRadius + (obs.type === 'mine' ? 10 : 0)) {
            obs.isDestroyed = true;
            if (obs.type === 'missile') {
              setTotalScore(prev => prev + 100);
              setMissileDestroyedCount(prev => prev + 1);
            }
          }
        }
      }

      if (obs.type === 'barrier') {
        if (drone.pulseActive) {
          const pdx = (obs.x + obs.w/2) - (drone.x + drone.w/2);
          const pdy = (obs.y + obs.h/2) - (drone.y + drone.h/2);
          const pdist = Math.sqrt(pdx*pdx + pdy*pdy);
          if (pdist < drone.pulseRadius + 20) {
            obs.isDestroyed = true;
          }
        }
      }

      if (obs.type === 'laser') {
        const cycle = (obs.laserOnDuration || 2) + (obs.laserOffDuration || 2);
        const t = (time / 1000) % cycle;
        obs.laserState = t < (obs.laserOnDuration || 2) ? 'on' : 'off';
      }

      obs.currentX = currentX;
      obs.currentY = currentY;

      if (obs.type === 'laser') {
        if (obs.laserState === 'on' && checkCollision(drone, { x: currentX, y: currentY, w: obs.w, h: obs.h })) {
          crashed = true;
        }
      } else {
        if (checkCollision(drone, { x: currentX, y: currentY, w: obs.w, h: obs.h })) {
          crashed = true;
          if (obs.type === 'missile') crashedByMissile = true;
          if (obs.type === 'missile' || obs.type === 'mine') obs.isDestroyed = true;
        }
      }
    });

    if (crashed) {
      if (handleCrash(crashedByMissile)) {
        soundRef.current?.playCrash();
        setGameState('gameover');
        return;
      } else {
        // Simple resolution to prevent getting stuck
        drone.x -= drone.vx * 2;
        drone.y -= drone.vy * 2;
      }
    }

    // Pad collision
    const pad = level.pad;
    if (checkCollision(drone, pad)) {
      const isSoft = drone.vy < 2.5;
      const isCentered = drone.x + drone.w / 2 > pad.x && drone.x + drone.w / 2 < pad.x + pad.w;
      const isTopHit = (drone.y + drone.h) - drone.vy <= pad.y + 5;

      if (isSoft && isCentered && isTopHit) {
        soundRef.current?.playWin();
        
        // Calculate Landing Accuracy
        const droneCenter = drone.x + drone.w / 2;
        const padCenter = pad.x + pad.w / 2;
        const maxDeviation = pad.w / 2;
        const deviation = Math.abs(droneCenter - padCenter);
        const accuracy = Math.max(0, 100 - (deviation / maxDeviation) * 100);
        setLandingAccuracy(accuracy);

        // Calculate Score
        const timeBonus = Math.max(0, Math.floor((level.parTime - currentTime) * 100));
        const fuelBonus = Math.floor((drone.fuel / (level.fuel * currentMods.battery)) * 500);
        const accuracyBonus = Math.floor(accuracy * 10); // Up to 1000 bonus for perfect landing
        const levelScore = 1000 + timeBonus + fuelBonus + accuracyBonus;
        
        setScore(levelScore);
        setTotalScore(prev => prev + levelScore);
        // Update medals
        // Update medals (Cumulative: once earned, they stay earned)
        setMedals(prev => {
          const idx = levelIndexRef.current;
          const current = prev[idx] || { time: false, fuel: false, accuracy: false };
          return {
            ...prev,
            [idx]: {
              time: current.time || currentTime < level.parTime,
              fuel: current.fuel || (drone.fuel / (level.fuel * currentMods.battery)) >= 0.9,
              accuracy: current.accuracy || accuracy > 90
            }
          };
        });
      
      setGameState('levelcomplete');
      } else {
        if (handleCrash()) {
          soundRef.current?.playCrash();
          setGameState('gameover');
        } else {
          drone.y -= 5; // bounce up
        }
      }
    }

    // Sync to state for UI
    setFuel(drone.fuel);
    setArmorHits(drone.armorHits);
    setPulseCooldown(drone.pulseCooldown);
  };

  const draw = (ctx: CanvasRenderingContext2D, time: number) => {
    const level = LEVELS[levelIndexRef.current];
    const currentMods = modsRef.current;
    const timeScale = slowmoRef.current > 0 ? 0.4 : 1;

    // Clear with shake
    ctx.save();
    if (shakeRef.current > 0) {
      const sx = (Math.random() - 0.5) * shakeRef.current;
      const sy = (Math.random() - 0.5) * shakeRef.current;
      ctx.translate(sx, sy);
    }

    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background Grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_HEIGHT); ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_WIDTH, i); ctx.stroke();
    }

    // Draw Wind Indicators
    if (Math.abs(level.wind.x) > 0 || Math.abs(level.wind.y) > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const wx = (time / 10 + i * 200) % CANVAS_WIDTH;
        const wy = (time / 20 + i * 150) % CANVAS_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + level.wind.x * 500, wy + level.wind.y * 500);
        ctx.stroke();
      }
    }

    // Draw Pad
    const pad = level.pad;
    ctx.fillStyle = '#22c55e'; // green-500
    ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#22c55e';
    ctx.fillRect(pad.x + 5, pad.y - 2, pad.w - 10, 2);
    ctx.shadowBlur = 0;

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
      const x = obs.currentX ?? obs.x;
      const y = obs.currentY ?? obs.y;
      
      if (obs.type === 'mine') {
        const pulse = Math.sin(time / 100) * 3;
        ctx.fillStyle = '#f87171'; // red-400
        ctx.beginPath();
        ctx.arc(x + obs.w/2, y + obs.h/2, obs.w/2 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7f1d1d'; // red-900
        ctx.beginPath();
        ctx.arc(x + obs.w/2, y + obs.h/2, obs.w/4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'missile') {
        ctx.save();
        ctx.translate(x + obs.w/2, y + obs.h/2);
        ctx.rotate(obs.angle || 0);
        
        // Missile body
        ctx.fillStyle = '#f97316'; // orange-500
        ctx.beginPath();
        ctx.moveTo(obs.w/2, 0);
        ctx.lineTo(-obs.w/2, -obs.h/2);
        ctx.lineTo(-obs.w/4, 0);
        ctx.lineTo(-obs.w/2, obs.h/2);
        ctx.closePath();
        ctx.fill();
        
        // Engine flame
        const flameSize = 5 + Math.random() * 5;
        ctx.fillStyle = '#fbbf24'; // amber-400
        ctx.beginPath();
        ctx.moveTo(-obs.w/4, 0);
        ctx.lineTo(-obs.w/4 - flameSize, -obs.h/4);
        ctx.lineTo(-obs.w/4 - flameSize * 1.5, 0);
        ctx.lineTo(-obs.w/4 - flameSize, obs.h/4);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      } else if (obs.type === 'barrier') {
        ctx.fillStyle = '#475569'; // slate-600
        ctx.fillRect(x, y, obs.w, obs.h);
        ctx.strokeStyle = '#94a3b8'; // slate-400
        ctx.lineWidth = 1;
        // Draw cracks
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + obs.w, y + obs.h);
        ctx.moveTo(x + obs.w, y); ctx.lineTo(x, y + obs.h);
        ctx.stroke();
        ctx.strokeRect(x, y, obs.w, obs.h);
      } else if (obs.type === 'laser') {
        if (obs.laserState === 'on') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; // red-500 with alpha
          ctx.fillRect(x, y, obs.w, obs.h);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(x + obs.w * 0.4, y, obs.w * 0.2, obs.h);
          // Glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ef4444';
          ctx.fillRect(x + obs.w * 0.45, y, obs.w * 0.1, obs.h);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#334155'; // slate-700 (inactive)
          ctx.fillRect(x, y, obs.w, 5);
          ctx.fillRect(x, y + obs.h - 5, obs.w, 5);
        }
      } else if (obs.type === 'wind') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const offset = (time / 5 + i * 20) % obs.w;
          ctx.beginPath();
          ctx.moveTo(x + offset, y);
          ctx.lineTo(x + offset + 10, y + obs.h);
          ctx.stroke();
        }
      } else if (obs.type === 'magnet') {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.beginPath();
        ctx.arc(x + obs.w/2, y + obs.h/2, obs.range || 100, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(x, y, obs.w, obs.h);
      } else if (obs.type === 'searchlight') {
        ctx.save();
        ctx.translate(x + obs.w/2, y + obs.h/2);
        ctx.rotate(obs.rotation || 0);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, obs.range || 300);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, obs.range || 300, -0.2, 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, obs.w, obs.h);
      } else {
        ctx.fillStyle = '#ef4444'; // red-500
        ctx.fillRect(x, y, obs.w, obs.h);
        ctx.strokeStyle = '#7f1d1d'; // red-900
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, obs.w, obs.h);
      }
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Pulse
    const drone = droneRef.current;
    if (drone.pulseActive) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)'; // cyan-400
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(drone.x + drone.w/2, drone.y + drone.h/2, drone.pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
      ctx.fill();
    }

    // Draw Powerups
    powerupsRef.current.forEach(p => {
      if (p.collected) return;
      
      const pulse = Math.sin(time / 200) * 2;
      
      if (p.type === 'fuel') {
        ctx.fillStyle = '#f59e0b'; // amber-500
        ctx.fillRect(p.x - pulse/2, p.y - pulse/2, 20 + pulse, 20 + pulse);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('F', p.x + 10, p.y + 14);
      } else if (p.type === 'shield') {
        ctx.fillStyle = '#3b82f6'; // blue-500
        ctx.beginPath();
        ctx.arc(p.x + 10, p.y + 10, 10 + pulse/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('S', p.x + 10, p.y + 14);
      } else if (p.type === 'slowmo') {
        ctx.fillStyle = '#8b5cf6'; // violet-500
        ctx.beginPath();
        ctx.moveTo(p.x + 10, p.y);
        ctx.lineTo(p.x + 20, p.y + 10);
        ctx.lineTo(p.x + 10, p.y + 20);
        ctx.lineTo(p.x, p.y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('T', p.x + 10, p.y + 14);
      }
    });

    // Draw Drone
    const keys = keysRef.current;
    const { x, y, w, h } = drone;

    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate(drone.tilt);

    // Shield effect
    if (drone.shieldActive) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, w * 0.8 + Math.sin(time/100)*2, 0, Math.PI * 2);
      ctx.stroke();
    }

    const currentSkin = SKINS[skinRef.current];

    ctx.fillStyle = currentSkin.color;
    ctx.fillRect(-w * 0.3, -h * 0.2, w * 0.6, h * 0.4);
    ctx.fillStyle = currentSkin.highlight;
    ctx.fillRect(-w * 0.5, -h * 0.4, w * 0.2, h * 0.2);
    ctx.fillRect(w * 0.3, -h * 0.4, w * 0.2, h * 0.2);
    ctx.fillStyle = currentSkin.dark;
    ctx.fillRect(-w * 0.3, h * 0.2, w * 0.1, h * 0.3);
    ctx.fillRect(w * 0.2, h * 0.2, w * 0.1, h * 0.3);

    if (gameStateRef.current === 'playing' && drone.fuel > 0) {
      ctx.fillStyle = '#38bdf8';
      if (keys.ArrowUp || keys.w) {
        ctx.fillRect(-w * 0.45, -h * 0.2, w * 0.1, h * 0.4);
        ctx.fillRect(w * 0.35, -h * 0.2, w * 0.1, h * 0.4);
      }
    }
    ctx.restore();

    // CRT Overlay
    if (isCRT) {
      ctx.fillStyle = 'rgba(18, 16, 16, 0.1)';
      for (let i = 0; i < CANVAS_HEIGHT; i += 4) {
        ctx.fillRect(0, i, CANVAS_WIDTH, 1);
      }
      
      const scanline = (time / 10) % CANVAS_HEIGHT;
      const grad = ctx.createLinearGradient(0, scanline - 20, 0, scanline + 20);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanline - 20, CANVAS_WIDTH, 40);
    }

    ctx.restore(); // Final restore from shake
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const loop = (time: number) => {
      update(time);
      draw(ctx, time);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const startGame = () => {
    soundRef.current?.init();
    soundRef.current?.playClick();
    setLevelIndex(0);
    setTotalScore(0);
    setMods({ engine: 1, battery: 1, armor: 0 });
    levelIndexRef.current = 0;
    scoreAtLevelStartRef.current = 0;
    resetDrone();
    setGameState('playing');
  };

  const nextLevel = () => {
    soundRef.current?.playClick();
    setGameState('shop');
  };

  const continueFromShop = () => {
    soundRef.current?.playClick();
    const nextIdx = levelIndex + 1;
    if (nextIdx >= LEVELS.length) {
      setGameState('won');
    } else {
      setLevelIndex(nextIdx);
      levelIndexRef.current = nextIdx;
      scoreAtLevelStartRef.current = totalScore;
      resetDrone();
      setGameState('playing');
    }
  };

  const getModCost = (type: 'engine' | 'battery' | 'armor' | 'magnet') => {
    if (type === 'engine') {
      const lvl = Math.round((mods.engine - 1) / 0.2);
      return 1500 + (lvl * 1000);
    }
    if (type === 'battery') {
      const lvl = Math.round((mods.battery - 1) / 0.2);
      return 1200 + (lvl * 800);
    }
    if (type === 'armor') {
      const lvl = mods.armor;
      return 2000 + (lvl * 1500);
    }
    if (type === 'magnet') {
      const lvl = Math.round((mods.magnet || 0) / 0.5);
      return 1000 + (lvl * 500);
    }
    return 0;
  };

  const buyMod = (type: 'engine' | 'battery' | 'armor' | 'magnet') => {
    const cost = getModCost(type);
    if (totalScore >= cost) {
      soundRef.current?.playPowerup();
      setTotalScore(prev => prev - cost);
      setMods(prev => ({
        ...prev,
        [type]: type === 'armor' ? prev.armor + 1 : type === 'magnet' ? (prev.magnet || 0) + 0.5 : prev[type] + 0.2
      }));
    } else {
      soundRef.current?.playCrash(); // error sound
    }
  };

  const buyOrEquipSkin = (skinId: SkinId) => {
    if (unlockedSkins.includes(skinId)) {
      setEquippedSkin(skinId);
      soundRef.current?.playClick();
    } else {
      const cost = SKINS[skinId].cost;
      if (totalScore >= cost) {
        setTotalScore(prev => prev - cost);
        setUnlockedSkins(prev => [...prev, skinId]);
        setEquippedSkin(skinId);
        soundRef.current?.playPowerup();
      } else {
        soundRef.current?.playCrash();
      }
    }
  };

  const retryLevel = () => {
    soundRef.current?.playClick();
    setTotalScore(scoreAtLevelStartRef.current);
    resetDrone();
    setGameState('playing');
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {['playing', 'gameover', 'levelcomplete'].includes(gameState) && (
        <div className="w-full bg-slate-900 rounded-xl p-3 md:p-4 border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Left: Time & Par */}
          <div className="flex gap-4 w-full sm:w-auto justify-around sm:justify-start">
            <div className="flex items-center gap-2 md:gap-3">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Time</span>
                <span className="text-base md:text-lg font-mono text-white leading-none mt-1">{levelTime.toFixed(1)}s</span>
              </div>
            </div>
            <div className="w-px h-6 md:h-8 bg-slate-700/50" />
            <div className="flex items-center gap-2 md:gap-3">
              <Timer className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Par</span>
                <span className="text-base md:text-lg font-mono text-slate-300 leading-none mt-1">{LEVELS[levelIndex].parTime.toFixed(1)}s</span>
              </div>
            </div>
          </div>

          {/* Center: Level Info & Score */}
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Level {levelIndex + 1}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-bold text-sm">{LEVELS[levelIndex].name}</span>
            </div>
            <div className="bg-slate-950 rounded-full px-3 py-1 flex items-center gap-2 border border-slate-800">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-mono text-yellow-400">{totalScore} CR</span>
            </div>
          </div>

          {/* Right: Pulse, Fuel & Armor */}
          <div className="flex gap-3 md:gap-4 items-center w-full sm:w-auto justify-around sm:justify-end">
            <div className="flex flex-col items-center gap-1">
              <div className="relative p-1 md:p-1.5 rounded-lg border bg-slate-900 border-slate-800">
                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700" />
                {pulseCooldown > 0 && (
                  <div className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{ clipPath: `inset(${100 - ((120 - pulseCooldown) / 120) * 100}% 0 0 0)` }}>
                    <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400" />
                  </div>
                )}
                {pulseCooldown === 0 && (
                  <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400 absolute inset-0 m-1 md:m-1.5" />
                )}
              </div>
              <span className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Pulse <span className="hidden md:inline">[Space]</span></span>
            </div>
            <div className="w-px h-6 md:h-8 bg-slate-700/50" />
            {armorHits > 0 && (
              <>
                <div className="flex items-center gap-2 md:gap-3">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Armor</span>
                    <span className="text-base md:text-lg font-mono text-blue-400 leading-none mt-1">{armorHits}</span>
                  </div>
                </div>
                <div className="w-px h-6 md:h-8 bg-slate-700/50" />
              </>
            )}
            <div className="flex flex-col gap-1 w-24 md:w-32">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Battery className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
                  <span className="text-[7px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fuel</span>
                </div>
                <span className="text-[10px] md:text-xs font-mono text-cyan-400">
                  {Math.max(0, Math.round((fuel / (LEVELS[levelIndex].fuel * mods.battery)) * 100))}%
                </span>
              </div>
              <div className="h-1.5 md:h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-75 ${
                    (fuel / (LEVELS[levelIndex].fuel * mods.battery)) > 0.5 ? 'bg-emerald-500' : 
                    (fuel / (LEVELS[levelIndex].fuel * mods.battery)) > 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, (fuel / (LEVELS[levelIndex].fuel * mods.battery)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-[min(100%,calc((100vh-280px)*4/3))] aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 mx-auto">
        <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full block"
      />

      <AnimatePresence>
        {gameState !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/95 backdrop-blur-md overflow-y-auto pt-4 md:items-center md:pt-0"
          >
            {gameState === 'menu' && (
              <div className="text-center space-y-6">
                <h2 className="text-4xl font-bold text-white">Drone Pilot</h2>
                <p className="text-slate-300 max-w-md mx-auto">
                  Navigate your drone to the landing pad. Avoid walls and moving obstacles. Land softly!
                  <br />
                  <span className="text-cyan-400 text-sm mt-2 block">NEW: Press [SPACE] to Pulse and destroy missiles/barriers!</span>
                </p>
                <button onClick={startGame} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold flex items-center gap-2 mx-auto transition-colors cursor-pointer">
                  <Play className="w-5 h-5" /> Start Game
                </button>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className="text-center space-y-6">
                <h2 className="text-4xl font-bold text-red-500">Drone Destroyed</h2>
                <p className="text-slate-300">You crashed! Watch your speed and avoid obstacles.</p>
                <button onClick={retryLevel} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-semibold flex items-center gap-2 mx-auto transition-colors cursor-pointer">
                  <RotateCcw className="w-5 h-5" /> Retry Level
                </button>
              </div>
            )}

            {gameState === 'levelcomplete' && (
              <div className="text-center space-y-6 md:space-y-8 bg-slate-900/60 p-8 md:p-12 rounded-3xl border border-white/5 backdrop-blur-2xl w-full max-w-2xl mx-4 my-auto shadow-2xl">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Trophy className="w-20 h-20 md:w-28 md:h-28 text-yellow-500 mx-auto drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase tracking-tighter italic">Mission Success</h2>
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-mono text-sm tracking-[0.2em] uppercase">
                    <span className="w-8 h-px bg-emerald-400/30" />
                    Level {levelIndex + 1} Cleared
                    <span className="w-8 h-px bg-emerald-400/30" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                  <div 
                    onClick={() => setBadgeInfo('Speed: Finish before the Par Time.')}
                    className={`p-4 rounded-2xl border transition-all duration-500 cursor-help active:scale-95 ${medals[levelIndex]?.time ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-slate-800/20 border-white/5 grayscale opacity-20'}`}
                  >
                    <Timer className={`w-8 h-8 mx-auto ${medals[levelIndex]?.time ? 'text-yellow-500' : 'text-slate-500'}`} />
                    <p className="text-[10px] font-black uppercase mt-2 tracking-widest">Speed</p>
                  </div>
                  <div 
                    onClick={() => setBadgeInfo('Fuel: Finish with more than 90% fuel remaining.')}
                    className={`p-4 rounded-2xl border transition-all duration-500 cursor-help active:scale-95 ${medals[levelIndex]?.fuel ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800/20 border-white/5 grayscale opacity-20'}`}
                  >
                    <Battery className={`w-8 h-8 mx-auto ${medals[levelIndex]?.fuel ? 'text-emerald-500' : 'text-slate-500'}`} />
                    <p className="text-[10px] font-black uppercase mt-2 tracking-widest">Fuel</p>
                  </div>
                  <div 
                    onClick={() => setBadgeInfo('Aim: Land with over 90% centering accuracy.')}
                    className={`p-4 rounded-2xl border transition-all duration-500 cursor-help active:scale-95 ${medals[levelIndex]?.accuracy ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-800/20 border-white/5 grayscale opacity-20'}`}
                  >
                    <Target className={`w-8 h-8 mx-auto ${medals[levelIndex]?.accuracy ? 'text-cyan-500' : 'text-slate-500'}`} />
                    <p className="text-[10px] font-black uppercase mt-2 tracking-widest">Aim</p>
                  </div>
                </div>

                <AnimatePresence>
                  {badgeInfo && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse"
                    >
                      {badgeInfo}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="bg-white/5 rounded-3xl p-6 space-y-3 backdrop-blur-sm border border-white/5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Base Reward</span>
                    <span className="font-mono text-lg text-white">1000</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Time Bonus</span>
                    <span className="font-mono text-lg text-emerald-400">+{Math.max(0, Math.floor((LEVELS[levelIndex].parTime - levelTime) * 100))}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Efficiency</span>
                    <span className="font-mono text-lg text-emerald-400">+{Math.floor((fuel / (LEVELS[levelIndex].fuel * mods.battery)) * 500)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Landing Accuracy</span>
                    <span className="font-mono text-lg text-cyan-400">+{Math.floor(landingAccuracy * 10)}</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500">Total Credits</span>
                    <span className="font-mono text-2xl text-yellow-500 font-black">{score}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setGameState('shop');
                    setBadgeInfo(null);
                  }} 
                  className="group relative px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Enter Hangar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            )}

            {gameState === 'shop' && (
              <div className="min-h-full w-full flex flex-col md:max-w-5xl md:max-h-[90vh] md:rounded-3xl border-t border-white/10 md:border bg-slate-900/40 backdrop-blur-2xl shadow-2xl safe-p-bottom">
                <div className="sticky top-0 z-10 px-6 py-4 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter italic">Hangar & Upgrades</h2>
                  <div className="px-4 py-2 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-xl md:text-2xl font-mono text-yellow-500 font-black">{totalScore} <span className="text-[10px] opacity-50 font-normal tracking-widest">CR</span></span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                  <div className="bg-slate-800/50 p-2 md:p-3 rounded-xl border border-slate-700 flex flex-col items-center gap-1 md:gap-2">
                    <Zap className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                    <h3 className="font-bold text-white text-center text-[10px] md:text-sm uppercase tracking-tight">Thrust</h3>
                    <div className="text-[8px] md:text-[10px] font-mono text-slate-400 leading-none">Lvl {Math.round((mods.engine - 1) / 0.2)}</div>
                    <button 
                      onClick={() => buyMod('engine')}
                      disabled={totalScore < getModCost('engine')}
                      className="mt-auto px-2 py-1 md:px-3 md:py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold w-full text-[9px] md:text-sm transition-colors cursor-pointer"
                    >
                      {getModCost('engine')}
                    </button>
                  </div>
                  
                  <div className="bg-slate-800/50 p-2 md:p-3 rounded-xl border border-slate-700 flex flex-col items-center gap-1 md:gap-2">
                    <Battery className="w-4 h-4 md:w-6 md:h-6 text-emerald-400" />
                    <h3 className="font-bold text-white text-center text-[10px] md:text-sm uppercase tracking-tight">Fuel</h3>
                    <div className="text-[8px] md:text-[10px] font-mono text-slate-400 leading-none">Lvl {Math.round((mods.battery - 1) / 0.2)}</div>
                    <button 
                      onClick={() => buyMod('battery')}
                      disabled={totalScore < getModCost('battery')}
                      className="mt-auto px-2 py-1 md:px-3 md:py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold w-full text-[9px] md:text-sm transition-colors cursor-pointer"
                    >
                      {getModCost('battery')}
                    </button>
                  </div>

                  <div className="bg-slate-800/50 p-2 md:p-3 rounded-xl border border-slate-700 flex flex-col items-center gap-1 md:gap-2">
                    <Shield className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />
                    <h3 className="font-bold text-white text-center text-[10px] md:text-sm uppercase tracking-tight">Armor</h3>
                    <div className="text-[8px] md:text-[10px] font-mono text-slate-400 leading-none">HP: {mods.armor}</div>
                    <button 
                      onClick={() => buyMod('armor')}
                      disabled={totalScore < getModCost('armor')}
                      className="mt-auto px-2 py-1 md:px-3 md:py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold w-full text-[9px] md:text-sm transition-colors cursor-pointer"
                    >
                      {getModCost('armor')}
                    </button>
                  </div>

                  <div className="bg-slate-800/50 p-2 md:p-3 rounded-xl border border-slate-700 flex flex-col items-center gap-1 md:gap-2">
                    <Magnet className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
                    <h3 className="font-bold text-white text-center text-[10px] md:text-sm uppercase tracking-tight">Magnet</h3>
                    <div className="text-[8px] md:text-[10px] font-mono text-slate-400 leading-none">Lvl {Math.round((mods.magnet || 0) / 0.5)}</div>
                    <button 
                      onClick={() => buyMod('magnet' as any)}
                      disabled={totalScore < getModCost('magnet' as any)}
                      className="mt-auto px-2 py-1 md:px-3 md:py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold w-full text-[9px] md:text-sm transition-colors cursor-pointer"
                    >
                      {getModCost('magnet' as any)}
                    </button>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-700 my-2 md:my-4" />
                <h3 className="text-sm md:text-xl font-bold text-white mb-2 md:mb-3 uppercase tracking-wider">Skins</h3>
                <div className="grid grid-cols-5 gap-1.5 md:gap-2">
                  {(Object.keys(SKINS) as SkinId[]).map((skinId) => {
                    const skin = SKINS[skinId];
                    const isUnlocked = unlockedSkins.includes(skinId);
                    const isEquipped = equippedSkin === skinId;
                    return (
                      <div key={skinId} className={`bg-slate-800/50 p-1 md:p-2 rounded-xl border ${isEquipped ? 'border-emerald-500' : 'border-slate-700'} flex flex-col items-center gap-1`}>
                        <div className="w-5 h-5 md:w-8 md:h-8 rounded-full shadow-inner border-2 border-slate-900" style={{ backgroundColor: skin.color }} />
                        <h4 className="font-bold text-white text-[6px] md:text-[10px] text-center truncate w-full uppercase tracking-tighter">{skin.name}</h4>
                        <button
                          onClick={() => buyOrEquipSkin(skinId)}
                          disabled={!isUnlocked && totalScore < skin.cost}
                          className={`mt-auto px-1 py-0.5 text-[7px] md:text-[10px] rounded-lg font-semibold w-full transition-colors cursor-pointer ${
                            isEquipped ? 'bg-emerald-500 text-white' :
                            isUnlocked ? 'bg-slate-600 hover:bg-slate-500 text-white' :
                            'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white'
                          }`}
                        >
                          {isEquipped ? 'Active' : isUnlocked ? 'Equip' : `${skin.cost}`}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-3 mt-4">
                  <button onClick={() => setGameState('menu')} className="px-4 md:px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-all border border-slate-700 cursor-pointer text-[10px] md:text-sm">
                    Menu
                  </button>
                  <button onClick={continueFromShop} className="px-6 md:px-8 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-[10px] md:text-sm">
                    Next Mission <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

            {gameState === 'won' && (
              <div className="text-center space-y-6">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
                <h2 className="text-4xl font-bold text-yellow-400">Mission Accomplished</h2>
                <p className="text-slate-300">You have completed all levels!</p>
                <button onClick={startGame} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold flex items-center gap-2 mx-auto transition-colors cursor-pointer">
                  <RotateCcw className="w-5 h-5" /> Play Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Mobile Controls */}
    {gameState === 'playing' && (
      <div className="md:hidden flex justify-between items-end p-6 fixed bottom-0 left-0 w-full z-50 pointer-events-none mb-4">
        {/* D-Pad */}
        <div className="grid grid-cols-3 gap-1 pointer-events-auto bg-slate-900/40 p-2 rounded-3xl backdrop-blur-sm border border-white/10 shadow-2xl">
          <div />
          <button 
            className="w-14 h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-slate-600 active:bg-emerald-500/50 active:scale-90 transition-all shadow-lg select-none touch-none"
            onPointerDown={(e) => { e.preventDefault(); keysRef.current['ArrowUp'] = true; }}
            onPointerUp={(e) => { e.preventDefault(); keysRef.current['ArrowUp'] = false; }}
            onPointerLeave={(e) => { e.preventDefault(); keysRef.current['ArrowUp'] = false; }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ArrowUp className="w-8 h-8 text-white" />
          </button>
          <div />
          <button 
            className="w-14 h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-slate-600 active:bg-emerald-500/50 active:scale-90 transition-all shadow-lg select-none touch-none"
            onPointerDown={(e) => { e.preventDefault(); keysRef.current['ArrowLeft'] = true; }}
            onPointerUp={(e) => { e.preventDefault(); keysRef.current['ArrowLeft'] = false; }}
            onPointerLeave={(e) => { e.preventDefault(); keysRef.current['ArrowLeft'] = false; }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ArrowLeft className="w-8 h-8 text-white" />
          </button>
          <button 
            className="w-14 h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-slate-600 active:bg-emerald-500/50 active:scale-90 transition-all shadow-lg select-none touch-none"
            onPointerDown={(e) => { e.preventDefault(); keysRef.current['ArrowDown'] = true; }}
            onPointerUp={(e) => { e.preventDefault(); keysRef.current['ArrowDown'] = false; }}
            onPointerLeave={(e) => { e.preventDefault(); keysRef.current['ArrowDown'] = false; }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ArrowDown className="w-8 h-8 text-white" />
          </button>
          <button 
            className="w-14 h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-slate-600 active:bg-emerald-500/50 active:scale-90 transition-all shadow-lg select-none touch-none"
            onPointerDown={(e) => { e.preventDefault(); keysRef.current['ArrowRight'] = true; }}
            onPointerUp={(e) => { e.preventDefault(); keysRef.current['ArrowRight'] = false; }}
            onPointerLeave={(e) => { e.preventDefault(); keysRef.current['ArrowRight'] = false; }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ArrowRight className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center pointer-events-auto">
          <button 
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all shadow-2xl select-none touch-none active:scale-90 ${
              pulseCooldown === 0 ? 'bg-cyan-500/30 border-cyan-400 shadow-cyan-500/50 animate-pulse' : 'bg-slate-800/80 border-slate-700 opacity-50'
            }`}
            onPointerDown={(e) => { e.preventDefault(); keysRef.current[' '] = true; }}
            onPointerUp={(e) => { e.preventDefault(); keysRef.current[' '] = false; }}
            onPointerLeave={(e) => { e.preventDefault(); keysRef.current[' '] = false; }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Zap className={`w-10 h-10 ${pulseCooldown === 0 ? 'text-cyan-300' : 'text-slate-500'}`} />
          </button>
          <span className="text-[10px] text-cyan-400 font-bold mt-2 tracking-widest uppercase bg-slate-900/60 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-sm">Pulse</span>
        </div>
      </div>
    )}
  </div>
  );
}
