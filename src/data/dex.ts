import { DexSpecies, EditionType, Rarity, Element, DexForm } from '../types/dex';

// Helper function to create standard edition
const standardEdition: EditionType = { kind: 'standard' };

// Helper function to create limited edition
const createLimitedEdition = (eventCode: string, startAt?: string, endAt?: string): EditionType => ({
  kind: 'limited',
  eventCode,
  startAt,
  endAt
});

// Helper function to create collaboration edition
const createCollabEdition = (brand: 'Pokemon' | 'Disney' | 'Other', campaign?: string): EditionType => ({
  kind: 'collab',
  brand,
  campaign
});

// Helper function to create a DexForm
const createForm = (
  formId: string,
  stage: 1 | 2 | 3,
  name: string,
  rarity: Rarity,
  element: Element,
  artUrl: string,
  edition: EditionType = standardEdition
): DexForm => ({
  formId,
  stage,
  name,
  rarity,
  element,
  artUrl,
  edition
});

export const DEX_SPECIES: DexSpecies[] = [
  {
    speciesId: 'plastic_eater',
    speciesName: 'PlasticEater Line',
    summary: 'Masters of plastic recycling, these creatures can break down even the toughest polymers into reusable materials.',
    forms: [
      createForm('plastic_eater_1', 1, 'PlasticEater', 'COMMON', 'plastic', '/assets/Plastic/Plastic-Plastivore-1.png'),
      createForm('plastic_eater_2', 2, 'PlasticEater-EX', 'RARE', 'plastic', '/assets/Plastic/Plastic-BottleBeast-2.png'),
      createForm('plastic_eater_3', 3, 'PlasticEater-Prime', 'EPIC', 'plastic', '/assets/Plastic/Plastic-Recycron-3.png')
    ]
  },
  {
    speciesId: 'metal_crusher',
    speciesName: 'MetalCrusher Line',
    summary: 'Heavy-duty recyclers that crush and reshape metal waste into new forms, specializing in industrial scrap.',
    forms: [
      createForm('metal_crusher_1', 1, 'MetalCrusher', 'COMMON', 'metal', '/assets/Metal/metal_cancruncher_1.png'),
      createForm('metal_crusher_2', 2, 'MetalCrusher-Pro', 'UNCOMMON', 'metal', '/assets/Metal/metal_Scrapjaw_2.png'),
      createForm('metal_crusher_3', 3, 'MetalCrusher-Master', 'EPIC', 'metal', '/assets/Metal/metal_IronTitan-3.png')
    ]
  },
  {
    speciesId: 'glass_breaker',
    speciesName: 'GlassBreaker Line',
    summary: 'Fragile yet powerful creatures that can shatter and reform glass into beautiful, recycled crystal structures.',
    forms: [
        createForm('glass_breaker_1', 1, 'GlassBreaker', 'UNCOMMON', 'glass', '/assets/Glass/Glass-glassgobbler-1.png'),
      createForm('glass_breaker_2', 2, 'GlassBreaker-Luxe', 'RARE', 'glass', '/assets/Glass/glass-_crystalshade-2.png'),
      createForm('glass_breaker_3', 3, 'GlassBreaker-Crystal', 'LEGENDARY', 'glass', '/assets/Glass/glass-photonix-3.png')
    ]
  },
  {
    speciesId: 'paper_shredder',
    speciesName: 'PaperShredder Line',
    summary: 'Swift recyclers that can slice through paper waste and transform it into new writing materials.',
    forms: [
      createForm('paper_shredder_1', 1, 'PaperShredder', 'COMMON', 'paper', '/assets/Paper/paper-cartonmunch-1.png'),
      createForm('paper_shredder_2', 2, 'PaperShredder-Fast', 'UNCOMMON', 'paper', '/assets/Paper/paper-papyrus-2.png'),
      createForm('paper_shredder_3', 3, 'PaperShredder-Blitz', 'RARE', 'paper', '/assets/Paper/paper-Leafscribe-3.png')
    ]
  },
  {
    speciesId: 'e_waste_reclaimer',
    speciesName: 'EWasteReclaimer Line',
    summary: 'Specialists in processing electronic waste, these creatures extract valuable materials from discarded gadgets and prevent toxic pollution.',
    forms: [
      createForm('e_waste_reclaimer_1', 1, 'EWasteReclaimer', 'COMMON', 'electronic', '/assets/E-waste/ewaste-electroslime-1.png'),
      createForm('e_waste_reclaimer_2', 2, 'EWasteReclaimer-Upgrade', 'UNCOMMON', 'electronic', '/assets/E-waste/ewaste-circuitbeast-2.png'),
      createForm('e_waste_reclaimer_3', 3, 'EWasteReclaimer-Prime', 'EPIC', 'electronic', '/assets/E-waste/ewaste-datacron-3.png')
    ]
  },
  // Collaboration Edition - Pokemon-inspired (placeholder)
  {
    speciesId: 'recyclemon_collab',
    speciesName: 'Recyclemon Line',
    summary: 'A special collaboration edition inspired by digital creatures. These EcoMons combine recycling power with collectible charm.',
    forms: [
      createForm('recyclemon_green_1', 1, 'Recyclemon-Green', 'UNCOMMON', 'nature', '/assets/noob.jpg',
        createCollabEdition('Pokemon', 'Digital Creatures')),
      createForm('recyclemon_green_2', 2, 'Recyclemon-Green-Evolved', 'RARE', 'nature', '/assets/noob.jpg',
        createCollabEdition('Pokemon', 'Digital Creatures')),
      createForm('recyclemon_green_3', 3, 'Recyclemon-Green-Master', 'EPIC', 'nature', '/assets/noob.jpg',
        createCollabEdition('Pokemon', 'Digital Creatures'))
    ]
  },
  // Collaboration Edition - Disney-inspired (placeholder)
  {
    speciesId: 'magic_recycler_collab',
    speciesName: 'MagicRecycler Line',
    summary: 'A whimsical collaboration edition featuring magical recycling creatures. Special placeholder art for future Disney partnership.',
    forms: [
      createForm('magic_recycler_blue_1', 1, 'MagicRecycler', 'RARE', 'water', '/assets/noob.jpg',
        createCollabEdition('Disney', 'Magical Recycling')),
      createForm('magic_recycler_blue_2', 2, 'MagicRecycler-Mystic', 'EPIC', 'water', '/assets/noob.jpg',
        createCollabEdition('Disney', 'Magical Recycling')),
      createForm('magic_recycler_blue_3', 3, 'MagicRecycler-Enchanted', 'LEGENDARY', 'water', '/assets/noob.jpg',
        createCollabEdition('Disney', 'Magical Recycling'))
    ]
  }
];

export default DEX_SPECIES;
