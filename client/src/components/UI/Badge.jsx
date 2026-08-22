import React from 'react';

const VARIANTS = {
  success: 'bg-success-500/10 text-success-400 border-success-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)]',
  warning: 'bg-warning-500/10 text-warning-400 border-warning-500/20 shadow-[inset_0_0_8px_rgba(245,158,11,0.15)]',
  danger: 'bg-danger-500/10 text-danger-400 border-danger-500/20 shadow-[inset_0_0_8px_rgba(239,68,68,0.15)]',
  primary: 'bg-primary-500/10 text-primary-400 border-primary-500/20 shadow-[inset_0_0_8px_rgba(99,102,241,0.15)]',
  neutral: 'bg-surface border-surface-border text-muted',
};

export function Badge({ children, variant = 'neutral', pulse = false, className = '' }) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border
        ${VARIANTS[variant] || VARIANTS.neutral}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-success-400' : 
          variant === 'warning' ? 'bg-warning-400' :
          variant === 'danger' ? 'bg-danger-400' :
          variant === 'primary' ? 'bg-primary-400' : 'bg-muted'
        } animate-ping`} />
      )}
      {children}
    </span>
  );
}
