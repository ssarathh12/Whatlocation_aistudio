import React from 'react';
import { Play, Compass, MapPin, Sparkles, Trophy, Server, ShieldCheck, Zap } from 'lucide-react';
import { CountryPuzzleConfig } from '../types';

interface HomeHeroProps {
  onStartIndia: () => void;
  onBrowsePuzzles: () => void;
  onOpenDomainGuide: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onStartIndia,
  onBrowsePuzzles,
  onOpenDomainGuide,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-16">
      {/* Subtle Background Elements */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-500/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Tagline Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs font-medium text-slate-300 shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">Production Release Ready</span>
            <span className="text-slate-600">|</span>
            <span>Custom Domain & Standalone Build</span>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none sm:leading-tight">
            Master Geography By{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300">
              Solving the Map
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Drag scattered states and provinces across the ocean margins, test your spatial memory,
            and snap them into their exact coordinates with satisfying audio and tactile precision.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-hero-play-india"
              onClick={onStartIndia}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-extrabold text-base shadow-lg shadow-emerald-950/50 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play India Puzzle (36 States)</span>
            </button>

            <button
              id="btn-hero-browse"
              onClick={onBrowsePuzzles}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-base border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5 text-teal-400" />
              <span>Browse Catalog</span>
            </button>
          </div>
        </div>

        {/* Featured India Highlight Box */}
        <div className="mt-14 max-w-4xl mx-auto bg-black/20 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-slate-700 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                🇮🇳
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Featured & Active
                  </span>
                  <span className="text-xs text-slate-400">36 States & UTs</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  भारत (India) State Puzzle
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
                  From Jammu & Kashmir to Tamil Nadu, Gujarat to Arunachal Pradesh — piece together all 28 states & 8 union territories.
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto flex-shrink-0">
              <button
                id="btn-hero-box-play"
                onClick={onStartIndia}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Playing</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Pillar Feature Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-teal-400" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Satisfying Snap Mechanics</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time vector dragging with distance tolerance detection and dual-tone harmonic audio chimes.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Custom Domain Ready</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optimized standalone architecture ready to bind directly to your acquired domain with SSL and zero cold-starts.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl text-left">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Scraper & Data Pipeline</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built-in shapefile conversion toolchain (DIVA-GIS) configured to scrape USA, Europe, Canada, and Brazil next.
            </p>
          </div>
        </div>

        {/* Domain CTA Banner */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenDomainGuide}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-teal-400 hover:text-teal-300 font-medium px-4 py-2 rounded-xl bg-slate-900/80 border border-teal-500/30 hover:border-teal-500/60 transition-all"
          >
            <Server className="w-4 h-4" />
            <span>Ready to connect your acquired domain? View DNS & Deployment Guide &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
