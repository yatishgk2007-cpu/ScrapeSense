import React from 'react';
import { GlassCard } from '../components/UI/GlassCard';
import { Badge } from '../components/UI/Badge';
import { History as HistoryIcon, Tag, AlertTriangle, ArrowRight } from 'lucide-react';

const MOCK_HISTORY = [
  { id: 1, date: 'Today, 10:45 AM', target: 'competitor-a.com', type: 'pricing', change: 'Pro Plan increased from $49 to $59', severity: 'high' },
  { id: 2, date: 'Yesterday, 14:20 PM', target: 'startup-b.io', type: 'feature', change: 'Added "Enterprise SSO" to features list', severity: 'medium' },
  { id: 3, date: 'Aug 18, 09:00 AM', target: 'rival-c.co', type: 'marketing', change: 'Hero copy changed: "The fastest way to code"', severity: 'low' },
  { id: 4, date: 'Aug 15, 11:30 AM', target: 'enterprise-d.com', type: 'pricing', change: 'Removed "Starter" plan option entirely', severity: 'high' },
];

export default function History() {
  return (
    <div className="p-8 animate-fade-in max-w-5xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Change History</h1>
        <p className="text-muted font-medium">Timeline of all detected modifications across tracked targets.</p>
      </header>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-surface-border before:to-transparent">
        {MOCK_HISTORY.map((item, idx) => (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-background bg-surface-hover shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {item.type === 'pricing' ? <Tag className="w-5 h-5 text-warning-400" /> : <HistoryIcon className="w-5 h-5 text-primary-400" />}
            </div>
            
            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4">
              <GlassCard className="p-5 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">{item.date}</span>
                  <Badge variant={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'primary'}>
                    {item.severity}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.target}</h3>
                <p className="text-sm text-on-background/90 mb-4">{item.change}</p>
                <button className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                  View Diff <ArrowRight className="w-3 h-3" />
                </button>
              </GlassCard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
