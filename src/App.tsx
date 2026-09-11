import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { PuzzlesCatalog } from './components/PuzzlesCatalog';
import { MapPuzzleGame } from './components/MapPuzzleGame';
import { AnalyticsView } from './components/AnalyticsView';
import { DomainDeployGuide } from './components/DomainDeployGuide';
import { AboutView } from './components/AboutView';
import { ActivePage, CountryPuzzleConfig } from './types';
import { PUZZLE_CATALOG } from './data/puzzles';
import { sound } from './utils/audio';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedPuzzle, setSelectedPuzzle] = useState<CountryPuzzleConfig>(PUZZLE_CATALOG[0]);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  const handleToggleMute = () => {
    const updated = sound.toggleMute();
    setIsMuted(updated);
  };

  const handleStartPuzzle = (puzzle: CountryPuzzleConfig) => {
    setSelectedPuzzle(puzzle);
    setActivePage('game');
  };

  const handleQuickStartIndia = () => {
    const indiaPuzzle = PUZZLE_CATALOG.find((p) => p.id === 'india') || PUZZLE_CATALOG[0];
    handleStartPuzzle(indiaPuzzle);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Sticky Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onQuickStart={handleQuickStartIndia}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {activePage === 'home' && (
          <HomeHero
            onStartIndia={handleQuickStartIndia}
            onBrowsePuzzles={() => setActivePage('puzzles')}
            onOpenDomainGuide={() => setActivePage('domain')}
          />
        )}

        {activePage === 'puzzles' && (
          <PuzzlesCatalog onSelectPuzzle={handleStartPuzzle} />
        )}

        {activePage === 'game' && (
          <MapPuzzleGame
            puzzle={selectedPuzzle}
            onBack={() => setActivePage('puzzles')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {activePage === 'analytics' && <AnalyticsView />}

        {activePage === 'domain' && <DomainDeployGuide />}

        {activePage === 'about' && <AboutView />}
      </main>

      {/* Footer (hidden during full screen game play to preserve edge-to-edge canvas) */}
      {activePage !== 'game' && (
        <footer className="border-t border-white/10 bg-black/20 py-8 text-center text-xs text-white/70">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} GeoPuzzle Platform. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActivePage('puzzles')}
                className="hover:text-white transition-colors"
              >
                Puzzles Catalog
              </button>
              <button
                onClick={() => setActivePage('domain')}
                className="hover:text-white transition-colors"
              >
                Domain & Hosting Guide
              </button>
              <button
                onClick={() => setActivePage('about')}
                className="hover:text-white transition-colors"
              >
                About & Architecture
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
