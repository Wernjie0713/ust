import React from 'react';
import { DexSpecies } from '../../types/dex';
import EcoDexSpeciesCard from './EcoDexSpeciesCard';

interface EcoDexGridProps {
  species: DexSpecies[];
  owned: Set<string>;
  onOpenDetail: (speciesId: string, formId?: string) => void;
}

export default function EcoDexGrid({
  species,
  owned,
  onOpenDetail
}: EcoDexGridProps) {
  if (species.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">No EcoMons Found</h3>
        <p className="text-white/70">
          Try adjusting your search terms or filters to find more EcoMons.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {species.map((speciesData, index) => (
        <div
          key={speciesData.speciesId}
          className="animate-[dexIn_.5s_ease-out_both]"
          style={{ animationDelay: `${index * 0.02}s` }}
        >
          <EcoDexSpeciesCard
            species={speciesData}
            owned={owned}
            onOpenDetail={onOpenDetail}
          />
        </div>
      ))}
    </div>
  );
}
