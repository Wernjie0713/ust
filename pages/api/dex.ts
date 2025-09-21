import type { NextApiRequest, NextApiResponse } from 'next';
import { EcoDexPayload, UserDexProgress } from '../../src/types/dex';
import { DEX_SPECIES } from '../../src/data/dex';

// Mock user progress - in a real app, this would come from a database
// For now, let's assume the user owns a few forms to demonstrate the functionality
const MOCK_USER_PROGRESS: UserDexProgress = {
  ownedFormIds: [
    'plastic_eater_1',
    'plastic_eater_2',
    'metal_crusher_1',
    'glass_breaker_1',
    'paper_shredder_1',
    'e_waste_reclaimer_1',
    'recyclemon_green_1'
  ],
  firstFoundAt: {
    'plastic_eater_1': '2024-01-15T10:30:00Z',
    'plastic_eater_2': '2024-01-20T14:45:00Z',
    'metal_crusher_1': '2024-01-18T09:15:00Z',
    'glass_breaker_1': '2024-01-22T16:20:00Z',
    'paper_shredder_1': '2024-01-25T11:10:00Z',
    'e_waste_reclaimer_1': '2024-01-28T13:25:00Z',
    'recyclemon_green_1': '2024-02-01T15:00:00Z'
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse<EcoDexPayload | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Calculate totals
    const totalForms = DEX_SPECIES.reduce((total, species) => total + species.forms.length, 0);
    const totalSpecies = DEX_SPECIES.length;
    const ownedForms = MOCK_USER_PROGRESS.ownedFormIds.length;
    
    // Calculate owned species (species where user owns at least one form)
    const ownedSpeciesSet = new Set<string>();
    DEX_SPECIES.forEach(species => {
      const hasOwnedForm = species.forms.some(form => 
        MOCK_USER_PROGRESS.ownedFormIds.includes(form.formId)
      );
      if (hasOwnedForm) {
        ownedSpeciesSet.add(species.speciesId);
      }
    });

    const payload: EcoDexPayload = {
      species: DEX_SPECIES,
      progress: MOCK_USER_PROGRESS,
      totals: {
        owned: ownedForms,
        total: totalForms,
        ownedSpecies: ownedSpeciesSet.size,
        totalSpecies: totalSpecies
      }
    };

    res.status(200).json(payload);
  } catch (error) {
    console.error('Error fetching dex data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}