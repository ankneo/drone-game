import React, { useState, useRef } from 'react';

interface JoystickProps {
  onChange: (directions: { up: boolean; down: boolean; left: boolean; right: boolean }) => void;
}

export function Joystick({ onChange }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const maxRadius = 40;

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setPosition({ x: 0, y: 0 });
    onChange({ up: false, down: false, left: false, right: false });
  };

  const updatePosition = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate offset from center
    let dx = e.clientX - rect.left - centerX;
    let dy = e.clientY - rect.top - centerY;
    
    // Constrain to maxRadius
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }
    
    setPosition({ x: dx, y: dy });

    // Determine direction based on a threshold so slight movements don't trigger it
    const threshold = 15;
    onChange({
      up: dy < -threshold,
      down: dy > threshold,
      left: dx < -threshold,
      right: dx > threshold
    });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-32 h-32 bg-slate-900/60 rounded-full border-2 border-slate-700 shadow-2xl backdrop-blur-sm pointer-events-auto touch-none select-none flex items-center justify-center ml-2"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Inner guiding circle */}
      <div className="absolute inset-0 m-auto w-12 h-12 rounded-full border border-white/5" />
      
      {/* Stick */}
      <div 
        className="w-14 h-14 bg-emerald-500/80 rounded-full border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] absolute"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      />
    </div>
  );
}
