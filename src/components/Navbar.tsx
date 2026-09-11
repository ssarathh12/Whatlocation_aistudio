import React from 'react';
import { Map, Trophy, Compass, Globe, Volume2, VolumeX, Sparkles, Server } from 'lucide-react';
import { ActivePage } from '../types';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onQuickStart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  isMuted,
  onToggleMute,
  onQuickStart,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="nav-brand"
          onClick={() => setActivePage('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-teal-300 transition-colors">
                GeoPuzzle
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                v1.0 Prod
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Interactive Geography Puzzle</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            id="nav-home"
            onClick={() => setActivePage('home')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'home'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home
          </button>
          <button
            id="nav-puzzles"
            onClick={() => setActivePage('puzzles')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'puzzles' || activePage === 'game'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Puzzles
          </button>
          <button
            id="nav-analytics"
            onClick={() => setActivePage('analytics')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activePage === 'analytics'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Analytics
          </button>
          <button
            id="nav-domain"
            onClick={() => setActivePage('domain')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activePage === 'domain'
                ? 'bg-slate-800 text-teal-300 shadow-sm border border-teal-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-4 h-4 text-teal-400" />
            Domain & Deploy
          </button>
          <button
            id="nav-about"
            onClick={() => setActivePage('about')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'about'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            About
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute game sounds' : 'Mute game sounds'}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            )}
          </button>

          {/* Quick Play CTA */}
          <button
            id="btn-nav-play-india"
            onClick={onQuickStart}
            className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Play India (36)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
