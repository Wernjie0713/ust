import React from 'react';
import { Rarity, Element } from '../../types/dex';

interface EcoDexFiltersProps {
  selectedRarities: Rarity[];
  selectedElements: Element[];
  obtainedFilter: 'all' | 'owned' | 'unowned';
  onRarityToggle: (rarity: Rarity) => void;
  onElementToggle: (element: Element) => void;
  onObtainedFilterChange: (filter: 'all' | 'owned' | 'unowned') => void;
}

const RARITIES: Rarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
const ELEMENTS: Element[] = ['plastic', 'metal', 'paper', 'glass', 'organic', 'electronic', 'nature', 'light', 'water', 'fire', 'earth', 'air'];

const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: 'bg-gray-500',
  UNCOMMON: 'bg-green-500',
  RARE: 'bg-blue-500',
  EPIC: 'bg-purple-500',
  LEGENDARY: 'bg-orange-500'
};

const ELEMENT_EMOJIS: Record<Element, string> = {
  plastic: '🗑️',
  metal: '⚙️',
  paper: '📄',
  glass: '🥃',
  organic: '🌱',
  electronic: '🔌',
  nature: '🌿',
  light: '✨',
  water: '💧',
  fire: '🔥',
  earth: '🌍',
  air: '💨'
};

export default function EcoDexFilters({
  selectedRarities,
  selectedElements,
  obtainedFilter,
  onRarityToggle,
  onElementToggle,
  onObtainedFilterChange
}: EcoDexFiltersProps) {
  return (
    <div className="space-y-4 bg-panel backdrop-blur-xl rounded-3xl p-4 border-glass shadow-soft ring-glow">
      {/* Obtained Filter */}
      <div>
        <h3 className="text-white font-semibold mb-2">Ownership</h3>
        <div className="flex gap-2">
          {[
            { key: 'all' as const, label: 'All' },
            { key: 'owned' as const, label: 'Owned' },
            { key: 'unowned' as const, label: 'Unowned' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => onObtainedFilterChange(option.key)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0
                ${obtainedFilter === option.key
                  ? 'bg-gradient-to-r from-white/30 to-white/10 text-white ring-1 ring-white/40 shadow-soft'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rarity Filter */}
      <div>
        <h3 className="text-white font-semibold mb-2">Rarity</h3>
        <div className="flex flex-wrap gap-2">
          {RARITIES.map((rarity) => {
            const isSelected = selectedRarities.includes(rarity);
            return (
              <button
                key={rarity}
                onClick={() => onRarityToggle(rarity)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0
                  shadow-soft ring-1 ring-white/25
                  ${isSelected
                    ? `${RARITY_COLORS[rarity]} text-white`
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }
                `}
              >
                {rarity}
              </button>
            );
          })}
        </div>
      </div>

      {/* Element Filter */}
      <div>
        <h3 className="text-white font-semibold mb-2">Element</h3>
        <div className="grid grid-cols-4 gap-2">
          {ELEMENTS.map((element) => {
            const isSelected = selectedElements.includes(element);
            return (
              <button
                key={element}
                onClick={() => onElementToggle(element)}
                className={`
                  p-3 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center gap-1
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0
                  ${isSelected
                    ? 'bg-white/20 text-white ring-1 ring-white/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }
                `}
              >
                <span className={`text-xl ${isSelected ? 'saturate-150' : ''}`}>{ELEMENT_EMOJIS[element]}</span>
                <span className="text-xs capitalize">{element}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedRarities.length > 0 || selectedElements.length > 0 || obtainedFilter !== 'all') && (
        <div className="pt-2 border-t border-white/10">
          <button
            onClick={() => {
              // Clear all filters
              onObtainedFilterChange('all');
              selectedRarities.forEach(r => onRarityToggle(r));
              selectedElements.forEach(e => onElementToggle(e));
            }}
            className="
              w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-200
              ring-1 ring-red-400/30 rounded-lg transition-all duration-200
              text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50
            "
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
