export type EditionType =
  | { kind: 'standard' }
  | { kind: 'limited'; eventCode: string; startAt?: string; endAt?: string }
  | { kind: 'collab'; brand: 'Pokemon' | 'Disney' | 'Other'; campaign?: string };

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type Element = 'plastic' | 'metal' | 'paper' | 'glass' | 'organic' | 'electronic' | 'nature' | 'light' | 'water' | 'fire' | 'earth' | 'air';

export interface DexForm {
  formId: string;
  stage: 1 | 2 | 3;
  name: string;
  rarity: Rarity;
  element: Element;
  artUrl: string;
  silhouetteUrl?: string;
  edition: EditionType;
}

export interface DexSpecies {
  speciesId: string;
  speciesName: string;
  summary: string;
  forms: DexForm[];
}

export interface UserDexProgress {
  ownedFormIds: string[];
  firstFoundAt?: Record<string, string>;
}

export interface EcoDexPayload {
  species: DexSpecies[];
  progress: UserDexProgress;
  totals: {
    owned: number;
    total: number;
    ownedSpecies: number;
    totalSpecies: number;
  };
}
