import React from 'react';
import { DexSpecies, DexForm } from '../../types/dex';
import EditionBadge from './EditionBadge';
import LockOverlay from './LockOverlay';

interface EcoDexDetailSheetProps {
  species: DexSpecies;
  ownedForms: string[];
  isOpen: boolean;
  onClose: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'text-gray-400',
  UNCOMMON: 'text-green-400',
  RARE: 'text-blue-400',
  EPIC: 'text-purple-400',
  LEGENDARY: 'text-orange-400'
};

const ELEMENT_EMOJIS: Record<string, string> = {
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

const OBTAIN_TIPS = {
  plastic: "Recycle plastic bottles and containers at designated collection points. Aim for 10+ plastic items per week.",
  metal: "Collect tin cans, aluminum foil, and scrap metal. Visit metal recycling centers in your area.",
  paper: "Recycle newspapers, cardboard boxes, and office paper. Look for paper recycling bins in public spaces.",
  glass: "Separate glass bottles and jars by color. Take them to glass recycling facilities.",
  organic: "Compost food waste and yard clippings. Set up a home composting system.",
  electronic: "Take old electronics to e-waste collection events. Never throw them in regular trash.",
  nature: "Participate in community clean-up events and tree-planting activities.",
  light: "Complete daily recycling challenges and maintain a perfect streak.",
  water: "Focus on water conservation while recycling. Every action counts!",
  fire: "Engage in high-intensity recycling events and community challenges.",
  earth: "Travel to different recycling locations and explore new collection points.",
  air: "Maintain consistent recycling habits and help others learn about sustainability."
};

export default function EcoDexDetailSheet({
  species,
  ownedForms,
  isOpen,
  onClose
}: EcoDexDetailSheetProps) {
  if (!isOpen) return null;

  const ownedSet = new Set(ownedForms);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white shadow-xl rounded-3xl">
        {/* Header */}
        <div className="bg-blue-600 rounded-t-3xl p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{species.speciesName}</h2>
              <p className="text-blue-100 mt-1">{species.summary}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-full transition-colors text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Evolution Chain */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolution Chain</h3>
            <div className="grid grid-cols-3 gap-4">
              {species.forms
                .sort((a, b) => a.stage - b.stage)
                .map((form) => {
                  const isOwned = ownedSet.has(form.formId);
                  return (
                    <div key={form.formId} className="text-center">
                      <div className="relative mb-3">
                        <div className="aspect-square rounded-2xl ring-1 ring-gray-200 overflow-hidden bg-gray-50">
                          <img
                            src={form.artUrl}
                            alt={form.name}
                            className={`w-full h-full object-cover transition-transform duration-200 hover:scale-[1.02] ${isOwned ? '' : 'grayscale brightness-0 opacity-90'}`}
                          />
                          {!isOwned && <LockOverlay locked={true} showTooltip={false} />}
                        </div>
                        {form.stage < 3 && (
                          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className={`font-medium ${isOwned ? 'text-gray-900' : 'text-white/40 tracking-widest'}`}>
                          {isOwned ? form.name : '????'}
                        </div>
                        <div className="text-sm text-gray-500">Stage {form.stage}</div>
                        <EditionBadge edition={form.edition} size="sm" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Form Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Details</h3>
            <div className="space-y-3">
              {species.forms.map((form) => {
                const isOwned = ownedSet.has(form.formId);
                return (
                  <div key={form.formId} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isOwned ? 'text-gray-900' : 'text-gray-400'}`}>
                          {isOwned ? form.name : '????'}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded-full ${RARITY_COLORS[form.rarity]} bg-current bg-opacity-10`}>
                          {form.rarity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ELEMENT_EMOJIS[form.element]}</span>
                        <span className="text-sm text-gray-600 capitalize">{form.element}</span>
                      </div>
                    </div>
                    <EditionBadge edition={form.edition} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* How to Obtain */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Obtain</h3>
            <div className="space-y-2">
              {species.forms.map((form) => (
                <div key={form.formId} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white ring-1 ring-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-medium">{form.stage}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Stage {form.stage}: {form.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {OBTAIN_TIPS[form.element] || "Recycle various materials to unlock this EcoMon!"}
                    </div>
                    {form.edition.kind === 'limited' && (
                      <div className="text-sm text-orange-600 mt-1 font-medium">
                        ⚠️ Limited Time Event: {form.edition.eventCode}
                        {form.edition.startAt && ` (${new Date(form.edition.startAt).toLocaleDateString()} - ${form.edition.endAt ? new Date(form.edition.endAt).toLocaleDateString() : 'Ongoing'})`}
                      </div>
                    )}
                    {form.edition.kind === 'collab' && (
                      <div className="text-sm text-purple-600 mt-1 font-medium">
                        🤝 Collaboration Edition: {form.edition.brand} - {form.edition.campaign}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
