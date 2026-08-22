import React from 'react';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatWidget({ title, value, icon: Icon, trend, trendLabel, colorClass = 'text-primary-400 bg-primary-500/10' }) {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;
  
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  
  return (
    <GlassCard className="p-5" glow>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      
      <div className="mt-2">
        <div className="text-4xl font-display font-semibold tracking-tight text-white">{value}</div>
        
        {(trend !== undefined || trendLabel) && (
          <div className="flex items-center gap-2 mt-3 text-xs font-medium">
            {trend !== undefined && (
              <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${isPositive ? 'text-success-400 bg-success-500/10' : isNegative ? 'text-danger-400 bg-danger-500/10' : 'text-muted bg-surface'}`}>
                <TrendIcon className="w-3 h-3" />
                {Math.abs(trend)}%
              </span>
            )}
            {trendLabel && <span className="text-muted">{trendLabel}</span>}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
