import React, { useState } from 'react';
import {
  Server,
  Globe,
  CheckCircle2,
  Copy,
  Terminal,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const DomainDeployGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
          <Server className="w-3.5 h-3.5" />
          Production Domain & Hosting
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Custom Domain Deployment & Scraper Pipeline
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Everything you need to launch your GeoPuzzle application on your acquired domain,
          configure DNS records, enable SSL, and run the country scraper pipeline.
        </p>
      </div>

      {/* Step 1: Production Build Architecture */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-xl font-bold">Production Build & Asset Optimization</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          The app is built on Vite + React with optimized asset chunking. All 36 India GeoJSON
          boundary files are optimized to 4 decimal precision (~11m ground accuracy), reducing bundle
          payload from 22MB to under 8.9MB while keeping 100% boundary fidelity.
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
          <span>npm run build</span>
          <button
            onClick={() => copyToClipboard('npm run build', 'cmd_build')}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
          >
            {copiedKey === 'cmd_build' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedKey === 'cmd_build' ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Step 2: DNS Setup for Acquired Domain */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h2 className="text-xl font-bold">Connecting Your Acquired Domain</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          To bind your domain (e.g. at Namecheap, GoDaddy, Cloudflare, or Google Domains), add these
          standard DNS records depending on your chosen hosting platform:
        </p>

        {/* DNS Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left text-xs font-mono border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Record Type</th>
                <th className="py-3 px-4">Host / Name</th>
                <th className="py-3 px-4">Value / Target</th>
                <th className="py-3 px-4">TTL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/40 text-slate-300">
              <tr>
                <td className="py-3 px-4 text-amber-400 font-bold">A</td>
                <td className="py-3 px-4">@ (root)</td>
                <td className="py-3 px-4 font-sans text-slate-400">
                  Target Host IP provided by your hosting provider
                </td>
                <td className="py-3 px-4">3600 (Auto)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-teal-400 font-bold">CNAME</td>
                <td className="py-3 px-4">www</td>
                <td className="py-3 px-4 font-sans text-slate-400">
                  your-domain.com or cname.hosting-provider.com
                </td>
                <td className="py-3 px-4">3600 (Auto)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Hosting Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-400" />
              <span>Cloud Run / GCP</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Use "Custom Domains (Preview)" in Cloud Run settings to verify domain and get auto-provisioned Google managed SSL.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Vercel / Netlify</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Zero configuration static hosting: connect your repo, set publish directory to <code className="text-teal-300">dist</code>, and add your custom domain.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Custom VPS (Nginx)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Deploy files to <code className="text-teal-300">/var/www/geopuzzle</code>, proxy SPA routes with <code className="text-teal-300">try_files $uri /index.html</code>, and run Certbot.
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: Next To-Do — Scraper Pipeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h2 className="text-xl font-bold">Next Up: Country Scraper Pipeline</h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            In Progress
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          As noted in the project roadmap, the scraper toolchain is located at{' '}
          <code className="text-teal-300">scripts/import-country.js</code>. It downloads
          administrative Level-1 shapefiles from DIVA-GIS or accepts custom ZIP files, converts them
          into normalized GeoJSON, calculates bounding centers, and appends them to the puzzle catalog.
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500"># Command to scrape United States 50 states:</span>
            <button
              onClick={() =>
                copyToClipboard(
                  'node scripts/import-country.js --country "United States" --level 1',
                  'cmd_scraper'
                )
              }
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              {copiedKey === 'cmd_scraper' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedKey === 'cmd_scraper' ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-teal-400">node scripts/import-country.js --country "United States" --level 1</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
            <span className="text-xl block mb-1">🇺🇸</span>
            <span className="font-semibold text-slate-300 block">USA</span>
            <span className="text-[10px] text-amber-400">50 States</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
            <span className="text-xl block mb-1">🇪🇺</span>
            <span className="font-semibold text-slate-300 block">Europe</span>
            <span className="text-[10px] text-amber-400">44 Countries</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
            <span className="text-xl block mb-1">🇨🇦</span>
            <span className="font-semibold text-slate-300 block">Canada</span>
            <span className="text-[10px] text-amber-400">13 Regions</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
            <span className="text-xl block mb-1">🇧🇷</span>
            <span className="font-semibold text-slate-300 block">Brazil</span>
            <span className="text-[10px] text-amber-400">27 States</span>
          </div>
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800">
            <span className="text-xl block mb-1">🇦🇺</span>
            <span className="font-semibold text-slate-300 block">Australia</span>
            <span className="text-[10px] text-amber-400">8 Regions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
