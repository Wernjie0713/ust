import React from 'react';

interface EcoDexHeaderProps {
  totals: {
    owned: number;
    total: number;
    ownedSpecies: number;
    totalSpecies: number;
  };
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function EcoDexHeader({
  totals,
  searchQuery,
  onSearchChange
}: EcoDexHeaderProps) {
  const progressPercentage = totals.total > 0 ? (totals.owned / totals.total) * 100 : 0;

  return (
    <div className="sticky top-0 z-30 space-y-4">
      {/* Progress Section */}
      <div className="bg-panel backdrop-blur-xl rounded-3xl p-6 border-glass shadow-soft ring-glow">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">EcoDex</h1>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {totals.owned}/{totals.total}
            </div>
            <div className="text-sm text-white/70">Forms Collected</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/70">
            <span>Species: {totals.ownedSpecies}/{totals.totalSpecies}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-white/15 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 transition-[width] duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search EcoMons by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full pl-12 pr-4 py-3
            bg-white/10 backdrop-blur-sm
            border border-white/20
            rounded-xl text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40
            transition-all duration-200
          "
        />
      </div>
    </div>
  );
}
