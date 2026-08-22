import React from 'react';

export function GlassCard({ children, className = '', hover = true, glow = false }) {
  return (
    <div 
      className={`
        bg-surface/50 backdrop-blur-md border border-surface-border rounded-xl 
        ${hover ? 'transition-all duration-300 hover:bg-surface/80 hover:border-primary-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]' : ''}
        ${glow ? 'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary-500/10 before:to-transparent before:pointer-events-none' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
