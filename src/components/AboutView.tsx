import React from 'react';
import { Compass, Heart, Globe, Cpu, ShieldCheck } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-500/20">
          <Compass className="w-8 h-8 text-slate-950 font-bold" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">About GeoPuzzle</h1>
        <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto">
          An educational geography platform transforming static maps into interactive, tactile spatial puzzles.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-400" />
            <span>The Concept</span>
          </h3>
          <p>
            Traditional geography memorization relies on flashcards or static atlases. GeoPuzzle
            engages motor memory and spatial recognition by challenging players to identify the
            unique boundary silhouettes of provinces and states, move them across ocean boundaries,
            and snap them into their actual geopolitical position.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>Cartography & Technology</span>
          </h3>
          <p>
            Built using modern web standards including React, Tailwind CSS, Leaflet.js, and CartoDB
            Positron/Voyager basemaps. All geographic boundaries are derived from official administrative
            GeoJSON datasets, optimized for zero-latency vector rendering on both high-end desktop workstations
            and mobile touch devices.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Open Source & Custom Domain Readiness</span>
          </h3>
          <p>
            The project is fully modular, enabling new countries to be added via shapefile scrapers
            and deployed seamlessly across any custom domain with automated SSL.
          </p>
        </div>
      </div>
    </div>
  );
};
