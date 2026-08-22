import React from 'react';
import { GlassCard } from '../components/UI/GlassCard';
import { Badge } from '../components/UI/Badge';
import { ExternalLink, MoreVertical, Search, Plus } from 'lucide-react';

const MOCK_COMPETITORS = [
  { id: 1, name: 'Competitor A', url: 'https://competitor-a.com', status: 'active', lastScrape: '10 mins ago', health: 100 },
  { id: 2, name: 'Startup B', url: 'https://startup-b.io', status: 'active', lastScrape: '1 hour ago', health: 98 },
  { id: 3, name: 'Rival C', url: 'https://rival-c.co', status: 'healing', lastScrape: '3 hours ago', health: 45 },
  { id: 4, name: 'Enterprise D', url: 'https://enterprise-d.com', status: 'active', lastScrape: '5 hours ago', health: 100 },
];

export default function Competitors() {
  return (
    <div className="p-8 animate-fade-in max-w-7xl mx-auto pb-24">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Competitors</h1>
          <p className="text-muted font-medium">Manage tracked target domains and scraper configurations.</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4" />
          Add Target
        </button>
      </header>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search competitors..." 
              className="w-full bg-background border border-surface-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 border-b border-surface-border text-xs uppercase tracking-wider text-muted">
                <th className="p-4 font-semibold">Target Name</th>
                <th className="p-4 font-semibold">URL</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Scraper Health</th>
                <th className="p-4 font-semibold">Last Scrape</th>
                <th className="p-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-sm">
              {MOCK_COMPETITORS.map(comp => (
                <tr key={comp.id} className="hover:bg-surface-hover/50 transition-colors">
                  <td className="p-4 font-medium text-white">{comp.name}</td>
                  <td className="p-4 text-muted">
                    <a href="#" className="flex items-center gap-1 hover:text-primary-400 transition-colors">
                      {comp.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-4">
                    <Badge variant={comp.status === 'active' ? 'success' : 'warning'} pulse={comp.status === 'healing'}>
                      {comp.status === 'active' ? 'Active' : 'Auto-Healing'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[100px] h-2 bg-surface border border-surface-border rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${comp.health > 90 ? 'bg-success-500' : 'bg-warning-500'}`}
                          style={{ width: `${comp.health}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted">{comp.health}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{comp.lastScrape}</td>
                  <td className="p-4 text-right">
                    <button className="p-1 hover:bg-surface rounded text-muted hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
