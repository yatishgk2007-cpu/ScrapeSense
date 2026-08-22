import React from 'react';
import { GlassCard } from '../components/UI/GlassCard';
import { Badge } from '../components/UI/Badge';
import { Play, AlertTriangle, Search, Stethoscope, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  { id: 'RUNNING', label: 'Running', icon: Play, color: 'success' },
  { id: 'FAILURE', label: 'Failure', icon: AlertTriangle, color: 'danger' },
  { id: 'CHANGE', label: 'Change', icon: Search, color: 'warning' },
  { id: 'HEALING', label: 'Healing', icon: Stethoscope, color: 'primary' },
  { id: 'APPROVED', label: 'Approved', icon: CheckCircle2, color: 'primary' },
  { id: 'RECOVERED', label: 'Recovered', icon: ShieldCheck, color: 'success' },
];

export default function HealingCenter() {
  // Mock current active step for the UI
  const currentStepIndex = 3; // "HEALING"

  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-success-400 mb-4 inline-flex items-center gap-3">
          <Stethoscope className="w-10 h-10 text-primary-400" />
          Self-Healing Center
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          ScrapeSense uses Bright Data Scraper Studio to automatically adapt to target website DOM changes, ensuring zero data loss.
        </p>
      </header>
      
      <GlassCard className="px-6 py-12 md:p-12 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            const isFuture = idx > currentStepIndex;
            
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative group">
                {/* Connecting Line */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[50%] right-[-50%] h-[2px]">
                    <div className={`h-full w-full ${isPast ? 'bg-primary-500/50' : 'bg-surface-border'} transition-colors duration-500`} />
                    {isActive && (
                      <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-primary-500 to-primary-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    )}
                  </div>
                )}
                
                {/* Step Node */}
                <div className={`
                  relative z-10 w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500 border-2 bg-surface
                  ${isActive ? `border-primary-400 shadow-[0_0_30px_rgba(99,102,241,0.3)] scale-110` : ''}
                  ${isPast ? `border-primary-500/30 text-primary-400` : ''}
                  ${isFuture ? 'border-surface-border text-surface-border' : ''}
                `}>
                  {isActive && (
                    <div className="absolute inset-[-4px] rounded-full border-2 border-primary-400/50 animate-ping opacity-20" />
                  )}
                  <step.icon className={`w-8 h-8 ${isActive ? 'text-primary-400 animate-pulse' : isPast ? 'text-primary-400/70' : 'text-surface-border/50'}`} />
                </div>
                
                {/* Step Label */}
                <div className="text-center mt-2">
                  <Badge variant={isActive ? 'primary' : isPast ? 'neutral' : 'neutral'} pulse={isActive} className={isFuture ? 'opacity-30' : ''}>
                    {step.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Area (Mock) */}
        <div className="mt-16 p-6 rounded-xl bg-surface/80 border border-primary-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="font-display font-bold text-xl text-white mb-2">Auto-Heal in Progress</h3>
            <p className="text-sm text-muted">The scraper "competitor-pricing" failed due to a missing selector: <code className="px-1.5 py-0.5 rounded bg-black/50 text-warning-400 font-mono text-xs">.pricing-table-v2</code>.</p>
            <p className="text-sm text-muted mt-1">Bright Data is currently analyzing the DOM to propose a new selector.</p>
          </div>
          <button className="relative z-10 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all flex items-center gap-2 group whitespace-nowrap">
            <Stethoscope className="w-4 h-4 animate-pulse" />
            Analyzing...
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
