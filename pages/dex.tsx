'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { DexSpecies, EcoDexPayload, Rarity, Element } from '../src/types/dex';
import EcoDexHeader from '../src/components/dex/EcoDexHeader';
import EcoDexFilters from '../src/components/dex/EcoDexFilters';
import EcoDexGrid from '../src/components/dex/EcoDexGrid';
import EcoDexDetailSheet from '../src/components/dex/EcoDexDetailSheet';

type TabType = 'all' | 'limited' | 'collab';

export default function EcoDexPage() {
  const router = useRouter();
  const { query, pathname, isReady } = router;

  const [data, setData] = useState<EcoDexPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [selectedElements, setSelectedElements] = useState<Element[]>([]);
  const [obtainedFilter, setObtainedFilter] = useState<'all' | 'owned' | 'unowned'>('all');

  // Detail Sheet State
  const [selectedSpecies, setSelectedSpecies] = useState<DexSpecies | null>(null);
  const [selectedSpeciesOwned, setSelectedSpeciesOwned] = useState<string[]>([]);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Fetch EcoDex data
  useEffect(() => {
    const fetchEcoDex = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dex');
        if (!response.ok) {
          throw new Error('Failed to fetch EcoDex data');
        }
        const ecoDexData: EcoDexPayload = await response.json();
        setData(ecoDexData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load EcoDex');
      } finally {
        setLoading(false);
      }
    };

    fetchEcoDex();
  }, []);

  // Handle URL params for detail sheet
  useEffect(() => {
    if (!isReady) return;
    const speciesId = query.species as string;
    if (speciesId && data) {
      const species = data.species.find(s => s.speciesId === speciesId);
      if (species) {
        openDetailSheet(species);
      }
    }
  }, [query.species, data, isReady]);

  // Filter and search logic
  const filteredSpecies = useMemo(() => {
    if (!data) return [];

    let filtered = data.species;

    // Tab filtering
    switch (activeTab) {
      case 'limited':
        filtered = filtered.filter(species =>
          species.forms.some(form => form.edition.kind === 'limited')
        );
        break;
      case 'collab':
        filtered = filtered.filter(species =>
          species.forms.some(form => form.edition.kind === 'collab')
        );
        break;
      default: // 'all'
        break;
    }

    // Search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(species =>
        species.speciesName.toLowerCase().includes(query) ||
        species.forms.some(form =>
          form.name.toLowerCase().includes(query)
        )
      );
    }

    // Rarity filtering
    if (selectedRarities.length > 0) {
      filtered = filtered.filter(species =>
        species.forms.some(form => selectedRarities.includes(form.rarity))
      );
    }

    // Element filtering
    if (selectedElements.length > 0) {
      filtered = filtered.filter(species =>
        species.forms.some(form => selectedElements.includes(form.element))
      );
    }

    // Ownership filtering
    if (obtainedFilter !== 'all' && data.progress) {
      const ownedSet = new Set(data.progress.ownedFormIds);
      filtered = filtered.filter(species => {
        const speciesOwned = species.forms.filter(form => ownedSet.has(form.formId)).length;
        const totalForms = species.forms.length;

        switch (obtainedFilter) {
          case 'owned':
            return speciesOwned > 0;
          case 'unowned':
            return speciesOwned < totalForms;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [data, activeTab, searchQuery, selectedRarities, selectedElements, obtainedFilter]);

  const ownedSet = useMemo(() => {
    return new Set(data?.progress?.ownedFormIds || []);
  }, [data]);

  const openDetailSheet = async (species: DexSpecies) => {
    try {
      const response = await fetch(`/api/dex/${species.speciesId}`);
      if (response.ok) {
        const speciesData = await response.json();
        setSelectedSpecies(speciesData);
        setSelectedSpeciesOwned(speciesData.ownedForms);
        setDetailSheetOpen(true);

        // Update URL with shallow routing
        router.push(`${pathname}?species=${species.speciesId}`, undefined, { shallow: true });
      }
    } catch (err) {
      console.error('Failed to load species details:', err);
    }
  };

  const closeDetailSheet = () => {
    setDetailSheetOpen(false);
    setSelectedSpecies(null);
    setSelectedSpeciesOwned([]);

    // Remove URL params with shallow routing
    router.push(pathname, undefined, { shallow: true });
  };

  const handleRarityToggle = (rarity: Rarity) => {
    setSelectedRarities(prev =>
      prev.includes(rarity)
        ? prev.filter(r => r !== rarity)
        : [...prev, rarity]
    );
  };

  const handleElementToggle = (element: Element) => {
    setSelectedElements(prev =>
      prev.includes(element)
        ? prev.filter(e => e !== element)
        : [...prev, element]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading EcoDex...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Error Loading EcoDex</h1>
          <p className="text-white/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4 pb-safe">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <EcoDexHeader
          totals={data?.totals || { owned: 0, total: 0, ownedSpecies: 0, totalSpecies: 0 }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Tabs */}
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1 ring-1 ring-white/10">
            <div className="flex gap-1">
              {[
                { key: 'all' as const, label: 'All', icon: '📚' },
                { key: 'limited' as const, label: 'Limited', icon: '✨' },
                { key: 'collab' as const, label: 'Collaboration', icon: '🤝' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2
                    ${activeTab === tab.key
                      ? 'bg-white/20 text-white ring-1 ring-white/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <EcoDexFilters
          selectedRarities={selectedRarities}
          selectedElements={selectedElements}
          obtainedFilter={obtainedFilter}
          onRarityToggle={handleRarityToggle}
          onElementToggle={handleElementToggle}
          onObtainedFilterChange={setObtainedFilter}
        />

        {/* Grid */}
        <EcoDexGrid
          species={filteredSpecies}
          owned={ownedSet}
          onOpenDetail={(speciesId) => {
            const species = data?.species.find(s => s.speciesId === speciesId);
            if (species) {
              openDetailSheet(species);
            }
          }}
        />
      </div>

      {/* Detail Sheet */}
      {selectedSpecies && (
        <EcoDexDetailSheet
          species={selectedSpecies}
          ownedForms={selectedSpeciesOwned}
          isOpen={detailSheetOpen}
          onClose={closeDetailSheet}
        />
      )}
    </div>
  );
}
