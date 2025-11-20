'use client';

import { useMemo } from 'react';

interface MagicalParticlesProps {
  count?: number;
}

export function MagicalParticles({ count = 25 }: MagicalParticlesProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      const sizeClass = Math.random() > 0.5 ? 'h-2 w-2' : 'h-1 w-1';
      const colorClass = ['bg-accent', 'bg-primary', 'bg-secondary'][index % 3];
      const opacityClass = `opacity-${Math.floor(Math.random() * 5 + 4) * 10}`;

      return {
        animation: index % 2 === 0 ? 'animate-sparkle' : 'animate-float',
        className: `absolute rounded-full ${sizeClass} ${colorClass} ${opacityClass}`,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 2,
        id: index,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      };
    });
  }, [count]);

  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      {particles.map((particle) => (
        <div
          className={`${particle.className} ${particle.animation}`}
          key={particle.id}
          style={{
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            left: particle.left,
            top: particle.top,
          }}
        />
      ))}
    </div>
  );
}
