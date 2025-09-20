import { NextRequest, NextResponse } from 'next/server';
import { DEX_SPECIES } from '../../../../data/dex';
import { DexSpecies } from '../../../../types/dex';

interface SpeciesResponse extends DexSpecies {
  ownedForms: string[];
  ownedCount: number;
  totalForms: number;
}

// Mock user progress - in a real app, this would come from a database
const mockUserProgress = {
  ownedFormIds: [
    'plastic_eater_1',
    'metal_crusher_1',
    'glass_breaker_1',
    'paper_shredder_1',
    'organic_composter_1',
    'plastic_warrior_ex_1'
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: { speciesId: string } }
) {
  try {
    const { speciesId } = params;

    const species = DEX_SPECIES.find(s => s.speciesId === speciesId);

    if (!species) {
      return NextResponse.json(
        { error: 'Species not found' },
        { status: 404 }
      );
    }

    // Find owned forms for this species
    const ownedForms = species.forms
      .filter(form => mockUserProgress.ownedFormIds.includes(form.formId))
      .map(form => form.formId);

    const response: SpeciesResponse = {
      ...species,
      ownedForms,
      ownedCount: ownedForms.length,
      totalForms: species.forms.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('EcoDex species API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch species data' },
      { status: 500 }
    );
  }
}
