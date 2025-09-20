import { NextRequest, NextResponse } from 'next/server';
import { DEX_SPECIES } from '../../../data/dex';
import { EcoDexPayload, DexSpecies } from '../../../types/dex';

// Mock user progress - in a real app, this would come from a database
const mockUserProgress = {
  ownedFormIds: [
    'plastic_eater_1',
    'metal_crusher_1',
    'glass_breaker_1',
    'paper_shredder_1',
    'organic_composter_1',
    'plastic_warrior_ex_1' // User owns the limited edition
  ],
  firstFoundAt: {
    'plastic_eater_1': '2024-01-15T10:30:00Z',
    'metal_crusher_1': '2024-01-20T14:22:00Z',
    'glass_breaker_1': '2024-02-01T09:15:00Z'
  }
};

export async function GET(request: NextRequest) {
  try {
    // Calculate totals
    const totalForms = DEX_SPECIES.reduce((sum, species) => sum + species.forms.length, 0);
    const ownedForms = mockUserProgress.ownedFormIds.length;
    const ownedSpecies = new Set(
      mockUserProgress.ownedFormIds.map(formId =>
        DEX_SPECIES.find(species =>
          species.forms.some(form => form.formId === formId)
        )?.speciesId
      ).filter(Boolean)
    ).size;
    const totalSpecies = DEX_SPECIES.length;

    const payload: EcoDexPayload = {
      species: DEX_SPECIES,
      progress: mockUserProgress,
      totals: {
        owned: ownedForms,
        total: totalForms,
        ownedSpecies,
        totalSpecies
      }
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('EcoDex API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch EcoDex data' },
      { status: 500 }
    );
  }
}
