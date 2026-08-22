import React from 'react';
import { GlassCard } from '../components/UI/GlassCard';
import { StatWidget } from '../components/UI/StatWidget';
import { Activity, ShieldCheck, Zap, Server } from 'lucide-react';

export default function Health() {
  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Scraper Health & Metrics</h1>
        <p className="text-muted font-medium">Detailed performance and stability metrics for Bright Data integrations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatWidget 
          title="Uptime" 
          value="99.9%" 
          icon={ShieldCheck} 
          trend={0.1} 
          colorClass="text-success-400 bg-success-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        />
        <StatWidget 
          title="Avg Latency" 
          value="1.2s" 
          icon={Zap} 
          trend={-0.3}
          trendLabel="faster than avg"
          colorClass="text-primary-400 bg-primary-500/10"
        />
        <StatWidget 
          title="Success Rate" 
          value="98.5%" 
          icon={Activity} 
          trend={2.4}
          colorClass="text-success-400 bg-success-500/10"
        />
        <StatWidget 
          title="Active Proxies" 
          value="452" 
          icon={Server} 
          colorClass="text-primary-400 bg-primary-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 h-[400px] flex flex-col justify-center items-center text-center">
          <Activity className="w-16 h-16 text-surface-border mb-4" />
          <h3 className="text-lg font-bold text-white">Throughput Chart</h3>
          <p className="text-sm text-muted">Placeholder for throughput visualization</p>
        </GlassCard>
        
        <GlassCard className="p-6 h-[400px] flex flex-col justify-center items-center text-center">
          <Server className="w-16 h-16 text-surface-border mb-4" />
          <h3 className="text-lg font-bold text-white">Proxy Distribution</h3>
          <p className="text-sm text-muted">Placeholder for map/distribution visualization</p>
        </GlassCard>
      </div>
    </div>
  );
}
