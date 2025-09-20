import React from 'react';
import { DexSpecies } from '../../types/dex';
import EditionBadge from './EditionBadge';
import LockOverlay from './LockOverlay';

interface EcoDexSpeciesCardProps {
  species: DexSpecies;
  owned: Set<string>;
  onOpenDetail: (speciesId: string, formId?: string) => void;
}

function ownedCount(owned: Set<string>, species: DexSpecies): number {
  return species.forms.filter(form => owned.has(form.formId)).length;
}

export default function EcoDexSpeciesCard({
  species,
  owned,
  onOpenDetail
}: EcoDexSpeciesCardProps) {
  const ownedFormsCount = ownedCount(owned, species);

  return (
    <div className="rounded-3xl p-4 bg-panel backdrop-blur-xl border-glass shadow-soft transition-transform duration-300 hover:translate-y-[-2px] hover:shadow-[0_12px_28px_rgba(0,0,0,.25)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg tracking-wide">{species.speciesName}</h3>
        <span className="text-sm text-white/70 bg-white/10 px-2 py-1 rounded-full">
          {ownedFormsCount}/{species.forms.length} owned
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {species.forms
          .sort((a, b) => a.stage - b.stage)
          .map((form) => {
            const isLocked = !owned.has(form.formId);

            return (
              <button
                key={form.formId}
                onClick={() => onOpenDetail(species.speciesId, form.formId)}
                className={`
                  relative rounded-xl p-3 bg-white/5 ring-1 ring-white/10
                  hover:ring-white/25 transition-all duration-200
                  hover:scale-105 active:scale-95
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0
                  ${isLocked ? 'opacity-75' : ''}
                `}
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/15 bg-white/5 mb-2">
                  {!isLocked && (
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-white/10 to-transparent blur-xl" />
                  )}
                  <img
                    src={form.artUrl}
                    alt={form.name}
                    className={`
                      w-full h-full object-cover transition-transform duration-200 hover:scale-[1.02]
                      ${isLocked ? "grayscale brightness-0 opacity-90" : ""}
                    `}
                    loading="lazy"
                  />
                  <LockOverlay locked={isLocked} showTooltip={true} />
                </div>

                <div className="text-center space-y-1">
                  <div className={`
                    text-sm font-medium
                    ${isLocked ? 'text-white/50' : 'text-white'}
                  `}>
                    {isLocked ? '????' : form.name}
                  </div>
                  <div className="text-xs text-white/60">
                    Stage {form.stage}
                  </div>
                  <div className="pt-1">
                    <EditionBadge edition={form.edition} size="sm" />
                  </div>
                </div>
              </button>
            );
          })}
      </div>

      <div className="mt-3 text-xs text-white/60 text-center leading-relaxed">
        {species.summary}
      </div>
    </div>
  );
}
