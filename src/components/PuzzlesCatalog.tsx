import React, { useState } from 'react';
import { Play, Search, Filter, Clock, MapPin, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CountryPuzzleConfig } from '../types';
import { PUZZLE_CATALOG } from '../data/puzzles';

interface PuzzlesCatalogProps {
  onSelectPuzzle: (puzzle: CountryPuzzleConfig) => void;
}

export const PuzzlesCatalog: React.FC<PuzzlesCatalogProps> = ({ onSelectPuzzle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'in_development'>('all');

  const filteredPuzzles = PUZZLE_CATALOG.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      filterDifficulty === 'all' || p.difficulty.toLowerCase() === filterDifficulty.toLowerCase();

    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Map Catalog
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Explore Geography Puzzles
        </h1>
        <p className="mt-2 text-base text-slate-400 max-w-2xl">
          Select a region to test your geographic intuition. Assemble states, territories, and countries back to their precise coordinates.
        </p>
      </div>

      {/* Filters & Search Controls */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-puzzle-search"
            type="text"
            placeholder="Search countries, regions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'available'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Playable (1)
            </button>
            <button
              onClick={() => setFilterStatus('in_development')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'in_development'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pipeline (5)
            </button>
          </div>

          {/* Difficulty Dropdown */}
          <select
            id="select-difficulty"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Grid of Puzzles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPuzzles.map((puzzle) => {
          const isAvailable = puzzle.status === 'available';

          return (
            <div
              key={puzzle.id}
              id={`puzzle-card-${puzzle.id}`}
              className={`group rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                isAvailable
                  ? 'bg-slate-900/90 border-slate-800 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-90'
              }`}
            >
              <div className="p-6">
                {/* Header with Emoji and Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl shadow-inner border border-slate-700/60 group-hover:scale-105 transition-transform">
                    {puzzle.emoji}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Ready to Play
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        Scraper Pipeline
                      </span>
                    )}

                    <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-800/80">
                      {puzzle.difficulty}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                  {puzzle.title}
                </h3>
                {puzzle.nativeTitle && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{puzzle.nativeTitle}</p>
                )}

                <p className="text-sm text-slate-400 mt-2 line-clamp-2">{puzzle.description}</p>

                {/* Metrics */}
                <div className="flex items-center gap-4 mt-5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>{puzzle.totalPieces} Pieces</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>~{Math.round(puzzle.totalPieces * 0.25)} mins</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {puzzle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/40 text-[10px] text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
                {isAvailable ? (
                  <button
                    id={`btn-play-${puzzle.id}`}
                    onClick={() => onSelectPuzzle(puzzle)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch Game</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 text-slate-500 font-medium text-xs cursor-not-allowed border border-slate-700/40 flex items-center justify-center gap-2"
                  >
                    <span>Extracting via Script (DIVA-GIS Pipeline)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
