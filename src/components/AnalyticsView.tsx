import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Shuffle, CheckCircle, Flame, RotateCcw, BarChart3, Calendar } from 'lucide-react';
import { GameStats } from '../types';
import { getStoredStats, clearGameStats, formatSeconds } from '../utils/analytics';

export const AnalyticsView: React.FC = () => {
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesCompleted: 0,
    totalTimeElapsed: 0,
    bestTime: null,
    totalShuffles: 0,
    history: [],
  });

  useEffect(() => {
    setStats(getStoredStats());
  }, []);

  const handleClear = () => {
    if (confirm('Clear all your saved game stats and history?')) {
      const cleared = clearGameStats();
      setStats(cleared);
    }
  };

  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesCompleted / stats.gamesPlayed) * 100) : 0;

  const averageTime =
    stats.gamesCompleted > 0
      ? Math.round(stats.totalTimeElapsed / stats.gamesCompleted)
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Performance & Insights
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Puzzle Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track solve speeds, accuracy, completion records, and game history.
          </p>
        </div>

        {stats.gamesPlayed > 0 && (
          <button
            id="btn-clear-stats"
            onClick={handleClear}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-700/50 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Games Completed */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.gamesCompleted}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {winRate}% completion rate ({stats.gamesPlayed} started)
          </span>
        </div>

        {/* Best Time */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Best Time</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {stats.bestTime !== null ? formatSeconds(stats.bestTime) : '--:--'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Personal solve record</span>
        </div>

        {/* Average Time */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Solve Time</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">
            {averageTime > 0 ? formatSeconds(averageTime) : '--:--'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across completed games</span>
        </div>

        {/* Shuffles Used */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Shuffles</span>
            <Shuffle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 font-mono">
            {stats.totalShuffles}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Assists requested</span>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-base">Recent Game Sessions</h3>
          </div>
          <span className="text-xs text-slate-400">{stats.history.length} logged</span>
        </div>

        {stats.history.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Trophy className="w-10 h-10 mx-auto text-slate-600 mb-2 stroke-1" />
            <p className="text-sm">No game sessions logged yet.</p>
            <p className="text-xs text-slate-600 mt-1">
              Start an India puzzle game to record your first stats!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Puzzle</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Pieces</th>
                  <th className="py-3 px-4 font-semibold">Elapsed Time</th>
                  <th className="py-3 px-4 font-semibold">Shuffles</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {stats.history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-2">
                      <span>🇮🇳</span>
                      <span>{item.puzzleName}</span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      {item.completed ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                          Solved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.score}/{item.totalPieces}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">
                      {formatSeconds(item.timeElapsed)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.shuffles}</td>
                    <td className="py-3 px-4 font-sans text-slate-500 text-xs">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
