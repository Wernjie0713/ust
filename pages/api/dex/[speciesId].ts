import type { NextApiRequest, NextApiResponse } from 'next';
import { DexSpecies } from '../../../src/types/dex';
import { DEX_SPECIES } from '../../../src/data/dex';

// Mock user progress - in a real app, this would come from a database
const MOCK_OWNED_FORMS = [
  'plastic_eater_1',
  'plastic_eater_2',
  'metal_crusher_1',
  'glass_breaker_1',
  'paper_shredder_1',
  'e_waste_reclaimer_1',
  'recyclemon_green_1'
];

export interface SpeciesDetailResponse extends DexSpecies {
  ownedForms: string[];
}

export default function handler(
  req: NextApiRequest, 
  res: NextApiResponse<SpeciesDetailResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { speciesId } = req.query;

  if (!speciesId || typeof speciesId !== 'string') {
    return res.status(400).json({ error: 'Species ID is required' });
  }

  try {
    // Find the species
    const species = DEX_SPECIES.find(s => s.speciesId === speciesId);
    
    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }

    // Filter owned forms for this species
    const ownedForms = species.forms
      .filter(form => MOCK_OWNED_FORMS.includes(form.formId))
      .map(form => form.formId);

    const response: SpeciesDetailResponse = {
      ...species,
      ownedForms
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching species details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}