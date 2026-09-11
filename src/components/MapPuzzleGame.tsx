import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  RotateCcw,
  HelpCircle,
  Trophy,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Clock,
  Shuffle,
  Volume2,
  VolumeX,
  Share2,
} from 'lucide-react';
import { CountryPuzzleConfig, PuzzlePiece } from '../types';
import { sound } from '../utils/audio';
import { saveGameSession, formatSeconds } from '../utils/analytics';

interface MapPuzzleGameProps {
  puzzle: CountryPuzzleConfig;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const SNAP_TOLERANCE_PX = 32;

// Layer Styles
const SCATTERED_STYLE: L.PathOptions = {
  color: '#e11d48', // Rose-600
  weight: 2,
  opacity: 0.9,
  fillColor: '#f43f5e',
  fillOpacity: 0.55,
};

const DRAGGING_STYLE: L.PathOptions = {
  color: '#f59e0b', // Amber-500
  weight: 3,
  opacity: 1.0,
  fillColor: '#fbbf24',
  fillOpacity: 0.7,
};

const SNAPPED_STYLE: L.PathOptions = {
  color: '#059669', // Emerald-600
  weight: 2.5,
  opacity: 1.0,
  fillColor: '#10b981',
  fillOpacity: 0.75,
};

const GUIDE_STYLE: L.PathOptions = {
  color: '#94a3b8', // Slate-400
  weight: 1.2,
  dashArray: '4, 4',
  opacity: 0.6,
  fillColor: '#cbd5e1',
  fillOpacity: 0.08,
  interactive: false,
};

export const MapPuzzleGame: React.FC<MapPuzzleGameProps> = ({
  puzzle,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const guideGroupRef = useRef<L.LayerGroup | null>(null);
  const piecesGroupRef = useRef<L.LayerGroup | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [totalPieces, setTotalPieces] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [shuffles, setShuffles] = useState<number>(0);
  const [showOutlines, setShowOutlines] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [showStateDrawer, setShowStateDrawer] = useState<boolean>(false);

  // Pieces data reference
  const piecesRef = useRef<{
    id: string;
    name: string;
    layer: L.GeoJSON;
    targetCenter: L.LatLng;
    originalCoords: any;
    isSnapped: boolean;
  }[]>([]);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Trigger celebration
  const triggerVictoryCelebration = useCallback((finalTime: number, totalShuffles: number) => {
    setIsCompleted(true);
    sound.playVictoryFanfare();

    // Confetti fireworks
    try {
      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    // Save session to analytics
    saveGameSession({
      puzzleId: puzzle.id,
      puzzleName: puzzle.name,
      timeElapsed: finalTime,
      shuffles: totalShuffles,
      completed: true,
      score: puzzle.totalPieces,
      totalPieces: puzzle.totalPieces,
    });
  }, [puzzle]);

  // Scatter a piece to coordinates outside the country
  const placeRandomlyOutside = useCallback(
    (layer: L.GeoJSON) => {
      const bounds = layer.getBounds();
      const currentCenter = bounds.getCenter();
      const { latMin, latMax, lngLeft, lngRight } = puzzle.bounds;

      const newLng =
        Math.random() < 0.5
          ? lngLeft[0] + Math.random() * (lngLeft[1] - lngLeft[0])
          : lngRight[0] + Math.random() * (lngRight[1] - lngRight[0]);

      const newLat = latMin + Math.random() * (latMax - latMin);
      const latDiff = newLat - currentCenter.lat;
      const lngDiff = newLng - currentCenter.lng;

      // Translate all latlngs in the layer
      layer.eachLayer((child: any) => {
        if (child.getLatLngs) {
          const shiftCoords = (coords: any): any => {
            if (Array.isArray(coords)) {
              return coords.map(shiftCoords);
            }
            if (coords && typeof coords.lat === 'number') {
              return L.latLng(coords.lat + latDiff, coords.lng + lngDiff);
            }
            return coords;
          };
          child.setLatLngs(shiftCoords(child.getLatLngs()));
        }
      });
    },
    [puzzle]
  );

  // Setup Drag & Snap Handler
  const attachDragHandlers = useCallback(
    (pieceData: typeof piecesRef.current[0], map: L.Map) => {
      const layer = pieceData.layer;

      layer.eachLayer((subLayer: any) => {
        let isDragging = false;
        let lastLatLng: L.LatLng | null = null;

        const onDown = (e: L.LeafletMouseEvent) => {
          if (pieceData.isSnapped) return;
          isDragging = true;
          lastLatLng = e.latlng;
          map.dragging.disable();

          if (subLayer.setStyle) {
            subLayer.setStyle(DRAGGING_STYLE);
          }
          L.DomEvent.stopPropagation(e);
        };

        const onMove = (e: L.LeafletMouseEvent) => {
          if (!isDragging || !lastLatLng || pieceData.isSnapped) return;

          const latDiff = e.latlng.lat - lastLatLng.lat;
          const lngDiff = e.latlng.lng - lastLatLng.lng;
          lastLatLng = e.latlng;

          // Shift coordinates
          layer.eachLayer((ch: any) => {
            if (ch.getLatLngs) {
              const shift = (coords: any): any => {
                if (Array.isArray(coords)) return coords.map(shift);
                if (coords && typeof coords.lat === 'number') {
                  return L.latLng(coords.lat + latDiff, coords.lng + lngDiff);
                }
                return coords;
              };
              ch.setLatLngs(shift(ch.getLatLngs()));
            }
          });

          // Edge auto-pan
          const containerPoint = map.latLngToContainerPoint(e.latlng);
          const size = map.getSize();
          const margin = 45;
          let panX = 0;
          let panY = 0;

          if (containerPoint.x < margin) panX = -12;
          else if (containerPoint.x > size.x - margin) panX = 12;
          if (containerPoint.y < margin) panY = -12;
          else if (containerPoint.y > size.y - margin) panY = 12;

          if (panX !== 0 || panY !== 0) {
            map.panBy([panX, panY], { animate: false });
          }
        };

        const onUp = () => {
          if (!isDragging || pieceData.isSnapped) return;
          isDragging = false;
          map.dragging.enable();

          // Check snapping proximity
          const currentBounds = layer.getBounds();
          const currentCenter = currentBounds.getCenter();

          // Calculate screen pixel distance between current center and target center
          const curPixel = map.latLngToLayerPoint(currentCenter);
          const targetPixel = map.latLngToLayerPoint(pieceData.targetCenter);
          const distPx = curPixel.distanceTo(targetPixel);

          if (distPx <= SNAP_TOLERANCE_PX) {
            // SNAP SUCCESS!
            pieceData.isSnapped = true;

            // Reset coordinates to exact original target coordinates
            layer.eachLayer((ch: any) => {
              if (ch.getLatLngs) {
                ch.setLatLngs(pieceData.originalCoords);
              }
              if (ch.setStyle) {
                ch.setStyle(SNAPPED_STYLE);
              }
              // Disable hover cursor
              if (ch.getElement && ch.getElement()) {
                ch.getElement().style.cursor = 'default';
              }
            });

            sound.playSnapSound();

            // Increment score
            setScore((prevScore) => {
              const newScore = prevScore + 1;
              if (newScore >= piecesRef.current.length) {
                // Game Completed!
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                triggerVictoryCelebration(elapsed, shuffles);
              }
              return newScore;
            });
          } else {
            // Reset to un-snapped style
            if (subLayer.setStyle) {
              subLayer.setStyle(SCATTERED_STYLE);
            }
          }
        };

        subLayer.on('mousedown', onDown);
        map.on('mousemove', onMove);
        map.on('mouseup', onUp);

        // Mobile touch support
        const elem = subLayer.getElement?.();
        if (elem) {
          elem.style.cursor = 'grab';
        }
      });
    },
    [triggerVictoryCelebration, shuffles]
  );

  // Load GeoJSON puzzle pieces
  const loadPuzzle = useCallback(
    async (map: L.Map) => {
      setLoading(true);
      setLoadProgress(0);
      piecesRef.current = [];

      try {
        const loadedData: { name: string; data: any }[] = [];
        const files = puzzle.files;
        let loadedCount = 0;

        for (const file of files) {
          try {
            const res = await fetch(`/maps/india/${file}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const cleanName = file.replace('.geojson', '').replace(/_/g, ' ');
            loadedData.push({ name: cleanName, data });
          } catch (err) {
            console.error(`Failed to load ${file}:`, err);
          }
          loadedCount++;
          setLoadProgress(Math.round((loadedCount / files.length) * 100));
        }

        setTotalPieces(loadedData.length);

        // Clear existing layers
        if (guideGroupRef.current) guideGroupRef.current.clearLayers();
        if (piecesGroupRef.current) piecesGroupRef.current.clearLayers();

        const guideGroup = guideGroupRef.current || L.layerGroup().addTo(map);
        const piecesGroup = piecesGroupRef.current || L.layerGroup().addTo(map);
        guideGroupRef.current = guideGroup;
        piecesGroupRef.current = piecesGroup;

        // Calculate combined bounds for initial zoom
        const combined = L.geoJSON(loadedData.map((d) => d.data));
        const bounds = combined.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.12));
        }

        // Build Guide & Playable pieces
        loadedData.forEach((item) => {
          // 1. Guide Outline Layer (Fixed in position)
          const guideLayer = L.geoJSON(item.data, {
            style: GUIDE_STYLE,
            interactive: false,
          }).addTo(guideGroup);

          const targetCenter = guideLayer.getBounds().getCenter();

          // Extract original coordinates
          let originalCoords: any = null;
          guideLayer.eachLayer((ch: any) => {
            if (ch.getLatLngs) {
              originalCoords = JSON.parse(JSON.stringify(ch.getLatLngs()));
            }
          });

          // 2. Movable Piece Layer
          const pieceLayer = L.geoJSON(item.data, {
            style: SCATTERED_STYLE,
          }).addTo(piecesGroup);

          // Add state tooltip label
          pieceLayer.bindTooltip(item.name, {
            sticky: true,
            className: 'bg-slate-900 text-white font-medium text-xs px-2 py-1 rounded shadow-md border border-slate-700',
          });

          const pieceData = {
            id: item.name.toLowerCase().replace(/\s+/g, '_'),
            name: item.name,
            layer: pieceLayer,
            targetCenter,
            originalCoords,
            isSnapped: false,
          };

          // Scatter initial position
          placeRandomlyOutside(pieceLayer);

          // Attach drag & snap listeners
          attachDragHandlers(pieceData, map);

          piecesRef.current.push(pieceData);
        });

        setLoading(false);
      } catch (error) {
        console.error('Critical failure loading puzzle:', error);
        setLoading(false);
      }
    },
    [puzzle, placeRandomlyOutside, attachDragHandlers]
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: puzzle.center,
        zoom: puzzle.zoom,
        minZoom: 3,
        maxZoom: 14,
        zoomControl: false,
      });

      // OpenStreetMap tiles (Free, reliable, no API keys)
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      // Re-position zoom control to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      loadPuzzle(map);
    }

    // Live timer
    startTimeRef.current = Date.now();
    setTimeElapsed(0);
    timerRef.current = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [puzzle, loadPuzzle]);

  // Toggle guide outlines visibility
  useEffect(() => {
    if (guideGroupRef.current && mapInstanceRef.current) {
      if (showOutlines) {
        if (!mapInstanceRef.current.hasLayer(guideGroupRef.current)) {
          guideGroupRef.current.addTo(mapInstanceRef.current);
        }
      } else {
        if (mapInstanceRef.current.hasLayer(guideGroupRef.current)) {
          mapInstanceRef.current.removeLayer(guideGroupRef.current);
        }
      }
    }
  }, [showOutlines]);

  // Shuffle remaining pieces
  const handleShuffleRemaining = () => {
    const unsnapped = piecesRef.current.filter((p) => !p.isSnapped);
    if (unsnapped.length === 0) return;

    unsnapped.forEach((piece) => {
      placeRandomlyOutside(piece.layer);
    });

    setShuffles((prev) => prev + 1);
    sound.playShuffleSound();
  };

  // Provide a hint for an un-snapped state
  const handleHint = () => {
    const unsnapped = piecesRef.current.filter((p) => !p.isSnapped);
    if (unsnapped.length === 0 || !mapInstanceRef.current) return;

    const target = unsnapped[Math.floor(Math.random() * unsnapped.length)];
    setActiveHint(target.name);
    sound.playHintSound();

    // Pulse highlight on the target piece
    target.layer.eachLayer((sub: any) => {
      if (sub.setStyle) {
        sub.setStyle({ color: '#38bdf8', weight: 4, fillColor: '#0284c7', fillOpacity: 0.8 });
        setTimeout(() => {
          if (!target.isSnapped && sub.setStyle) {
            sub.setStyle(SCATTERED_STYLE);
          }
        }, 2500);
      }
    });

    // Pan map smoothly to the piece center
    const bounds = target.layer.getBounds();
    mapInstanceRef.current.panTo(bounds.getCenter(), { animate: true, duration: 0.8 });

    setTimeout(() => {
      setActiveHint(null);
    }, 3500);
  };

  // Reset current puzzle
  const handleReset = () => {
    if (confirm('Restart the puzzle from scratch?')) {
      setScore(0);
      setIsCompleted(false);
      setShuffles(0);
      startTimeRef.current = Date.now();
      setTimeElapsed(0);

      piecesRef.current.forEach((p) => {
        p.isSnapped = false;
        placeRandomlyOutside(p.layer);
        p.layer.eachLayer((sub: any) => {
          if (sub.setStyle) sub.setStyle(SCATTERED_STYLE);
        });
      });

      sound.playShuffleSound();
    }
  };

  const percentage = totalPieces > 0 ? Math.round((score / totalPieces) * 100) : 0;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-transparent overflow-hidden select-none">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white px-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-pulse mb-6">
            <Sparkles className="w-8 h-8 text-slate-950" />
          </div>
          <h3 className="text-xl font-bold mb-2">Preparing {puzzle.name} Puzzle</h3>
          <p className="text-sm text-slate-400 mb-6">Loading precision state polygons & boundaries...</p>

          <div className="w-64 max-w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full transition-all duration-200"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 mt-2 font-mono">{loadProgress}% complete</span>
        </div>
      )}

      {/* Top Floating Control Bar (HUD) */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Back & Puzzle Name */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="btn-game-back"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 bg-black/30 hover:bg-black/50 text-white rounded-xl shadow-lg border border-white/10 backdrop-blur-md transition-all active:scale-95 text-xs sm:text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Puzzles</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-black/30 text-white rounded-xl shadow-lg border border-white/10 backdrop-blur-md">
            <span className="text-lg">{puzzle.emoji}</span>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold leading-tight">{puzzle.name}</div>
              <div className="text-[10px] text-slate-400">{puzzle.difficulty} Mode</div>
            </div>
          </div>
        </div>

        {/* Center: Live Stats HUD */}
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 bg-black/30 text-white rounded-2xl shadow-xl border border-white/10 backdrop-blur-md">
          {/* Snapped Count */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
                  {score}/{totalPieces}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Snapped
                </span>
              </div>
              <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden mt-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 hidden sm:inline">
              {percentage}%
            </span>
          </div>

          <div className="w-px h-6 bg-slate-700/80 mx-1" />

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-medium text-slate-200">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatSeconds(timeElapsed)}</span>
          </div>
        </div>

        {/* Right: Actions (Shuffle, Outlines, Hint, Drawer) */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Outlines Guide Toggle */}
          <button
            id="btn-toggle-outlines"
            onClick={() => setShowOutlines(!showOutlines)}
            title={showOutlines ? 'Hide guide outlines' : 'Show guide outlines'}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium border shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 ${
              showOutlines
                ? 'bg-black/30 text-teal-300 border-teal-500/40 hover:bg-black/50'
                : 'bg-black/30 text-slate-400 border-white/10 hover:text-white hover:bg-black/50'
            }`}
          >
            {showOutlines ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden lg:inline">{showOutlines ? 'Guide: On' : 'Guide: Off'}</span>
          </button>

          {/* Shuffle Button */}
          <button
            id="btn-shuffle-pieces"
            onClick={handleShuffleRemaining}
            title="Scatter remaining pieces"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-black/30 text-slate-200 hover:text-white hover:bg-black/50 border border-white/10 shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Shuffle className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Shuffle ({totalPieces - score})</span>
          </button>

          {/* Hint Button */}
          <button
            id="btn-game-hint"
            onClick={handleHint}
            title="Highlight a remaining piece"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-black/30 text-amber-300 hover:bg-black/50 border border-amber-500/30 shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Hint</span>
          </button>

          {/* State List Drawer Toggle */}
          <button
            id="btn-states-drawer"
            onClick={() => setShowStateDrawer(!showStateDrawer)}
            title="View states roster"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium bg-black/30 text-slate-200 hover:text-white hover:bg-black/50 border border-white/10 shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-teal-400" />
            <span className="hidden md:inline">Roster</span>
          </button>

          {/* Reset */}
          <button
            id="btn-game-reset"
            onClick={handleReset}
            title="Reset puzzle"
            className="p-2 rounded-xl bg-black/30 text-slate-400 hover:text-rose-400 hover:bg-black/50 border border-white/10 shadow-lg backdrop-blur-md transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Hint Banner */}
      {activeHint && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 font-bold px-4 py-1.5 rounded-full shadow-lg text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>Locating piece: {activeHint}</span>
        </div>
      )}

      {/* Floating Instructions Bottom Pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden sm:block">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          <span>Drag red pieces from the margins and drop them onto their geographic positions.</span>
        </div>
      </div>

      {/* States Roster Side Panel Drawer */}
      {showStateDrawer && (
        <div className="absolute top-16 right-4 bottom-4 w-80 max-w-[calc(100vw-2rem)] z-30 bg-slate-900/95 backdrop-blur-lg border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">State & Territory Roster</h4>
              <p className="text-xs text-slate-400">
                {score} of {totalPieces} in place
              </p>
            </div>
            <button
              onClick={() => setShowStateDrawer(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
            {piecesRef.current.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  if (mapInstanceRef.current) {
                    const bounds = p.layer.getBounds();
                    mapInstanceRef.current.panTo(bounds.getCenter(), { animate: true });
                  }
                }}
                className="p-2 rounded-lg hover:bg-black/50/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  {p.isSnapped ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  )}
                  <span className={p.isSnapped ? 'text-slate-400 line-through' : 'font-medium text-slate-200'}>
                    {p.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {p.isSnapped ? 'Snapped' : 'Floating'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Victory Celebration Modal */}
      {isCompleted && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6">
              <Trophy className="w-10 h-10 text-slate-950" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1 text-white">
              Subcontinent Assembled!
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              You successfully placed all {totalPieces} states and union territories of India!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-800/60 p-4 rounded-2xl border border-white/10">
              <div className="text-left">
                <span className="text-xs text-slate-400 block mb-0.5">Total Time</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {formatSeconds(timeElapsed)}
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-slate-400 block mb-0.5">Shuffles Used</span>
                <span className="text-xl font-bold font-mono text-teal-300">{shuffles}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="btn-victory-replay"
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                id="btn-victory-catalog"
                onClick={onBack}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-all text-sm flex items-center justify-center gap-2"
              >
                All Puzzles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
