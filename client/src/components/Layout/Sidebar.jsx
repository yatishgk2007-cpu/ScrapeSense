import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitCompare,
  History,
  Activity,
  Stethoscope
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Competitors', path: '/competitors', icon: Users },
  { name: 'Comparison', path: '/comparison', icon: GitCompare },
  { name: 'History', path: '/history', icon: History },
  { name: 'Scraper Health', path: '/health', icon: Activity },
];

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-surface-border bg-background/50 backdrop-blur-xl flex flex-col h-full">

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gradient-primary">
          ScrapeSense
        </h1>

        <p className="text-[10px] uppercase tracking-wider text-muted mt-2 font-semibold">
          Competitive intelligence
          <br />
          that heals itself.
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-muted hover:text-white hover:bg-surface-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-primary-400' : 'text-muted'
                    }`}
                  />

                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-6 border-t border-surface-border">

          <p className="px-3 text-[10px] uppercase tracking-wider font-semibold text-muted mb-3">
            Hero Feature
          </p>

          <NavLink
            to="/healing-center"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface border border-surface-border text-white hover:border-primary-500/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Stethoscope
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-primary-400'
                  }`}
                />

                <span>Healing Center</span>
              </>
            )}
          </NavLink>

        </div>

      </nav>

      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3 px-3 py-2 bg-surface/30 rounded-md border border-surface-border">

          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />

          <span className="text-xs font-medium text-muted">
            System Active
          </span>

        </div>
      </div>

    </aside>
  );
}