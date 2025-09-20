'use client'

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../utils/auth';

// EcoMon Battle System - Eco-themed Combat

interface BattleEcoMon {
  id: string;
  name: string;
  type: 'plastic' | 'metal' | 'glass' | 'paper' | 'organic' | 'electronic' | 'textile';
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  abilities: BattleAbility[];
  avatar: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  shield?: number;             // NEW temp HP
  mods?: TimedModifier[];      // NEW active buffs/debuffs
  status?: Status[];           // NEW active statuses
}

// Effect System Types
type EffectKind = 'damage' | 'heal' | 'shield' | 'buff' | 'debuff' | 'status' | 'energy';
type Stat = 'attack' | 'defense' | 'speed' | 'hp';

interface AbilityEffect {
  kind: EffectKind;
  target: 'self' | 'enemy';
  value?: number;          // flat value, e.g., 20 damage, 30 shield, 10 heal
  scale?: number;          // scale with caster stat (e.g., 0.6 * attack)
  stat?: Stat;             // for buff/debuff
  duration?: number;       // turns for buff/debuff/status
  statusName?: 'bleed' | 'regen' | 'overload' | 'rust' | 'crack';
  chance?: number;         // 0..1 RNG gate
}

interface TimedModifier {
  stat: Stat;            // e.g., 'attack'
  amountPct: number;     // +0.25 = +25%, -0.2 = -20%
  turnsLeft: number;
}

interface Status {
  name: 'bleed' | 'regen' | 'overload' | 'rust' | 'crack';
  value?: number;        // DOT/HOT tick amount (optional)
  turnsLeft: number;
}

interface BattleAbility {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  type: 'attack' | 'defense' | 'heal' | 'special';
  element: string;
  animation: string;
  accuracy?: number;
  critChance?: number;
  effects?: AbilityEffect[]; // NEW
}

interface BattleState {
  phase: 'selection' | 'battle' | 'victory' | 'defeat';
  turn: 'player' | 'opponent';
  playerEcoMon: BattleEcoMon | null;
  opponentEcoMon: BattleEcoMon | null;
  playerEnergy: number;
  opponentEnergy: number;
  maxEnergy: number;
  battleLog: string[];
  isAnimating: boolean;
  selectedAbility: BattleAbility | null;
  currentRound: number;
  playerWins: number;
  opponentWins: number;
  roundsToWin: number;
}

// Sample EcoMons for battle
const BATTLE_ECOMONS: BattleEcoMon[] = [
  {
    id: 'plastic_warrior',
    name: 'PlasticEater Alpha',
    type: 'plastic',
    level: 15,
    hp: 120,
    maxHp: 120,
    attack: 85,
    defense: 70,
    speed: 75,
    avatar: '/assets/m1.png',
    rarity: 'rare',
    shield: 0,
    mods: [],
    status: [],
    abilities: [
      {
        id: 'plastic_chomp',
        name: 'Plastic Chomp',
        description: 'Devours plastic waste to deal damage',
        energyCost: 1,
        type: 'attack',
        element: 'plastic',
        animation: '🦎💥',
        effects: [
          { kind: 'damage', target: 'enemy', value: 18, scale: 0.5 },
          { kind: 'debuff', target: 'enemy', stat: 'defense', value: 15, duration: 2, chance: 0.35 }
        ]
      },
      {
        id: 'polymer_blast',
        name: 'Polymer Blast',
        description: 'Explosive polymer breakdown attack',
        energyCost: 2,
        type: 'attack',
        element: 'plastic',
        animation: '💥🌪️',
        effects: [
          { kind: 'damage', target: 'enemy', value: 32, scale: 0.7 },
          { kind: 'status', target: 'enemy', statusName: 'overload', duration: 1, chance: 0.35 }
        ]
      },
      {
        id: 'eco_shield',
        name: 'Eco Shield',
        description: 'Creates a protective barrier from recycled materials',
        energyCost: 1,
        type: 'defense',
        element: 'neutral',
        animation: '🛡️✨',
        effects: [
          { kind: 'shield', target: 'self', value: 30 }
        ]
      },
      {
        id: 'regenerate',
        name: 'Regenerate',
        description: 'Heals by absorbing environmental energy',
        energyCost: 2,
        type: 'heal',
        element: 'nature',
        animation: '🌱💚',
        effects: [
          { kind: 'heal', target: 'self', value: 10, scale: 0.3 },
          { kind: 'status', target: 'self', statusName: 'regen', value: 6, duration: 2 }
        ]
      }
    ]
  },
  {
    id: 'metal_crusher',
    name: 'MetalCrusher Beta',
    type: 'metal',
    level: 18,
    hp: 150,
    maxHp: 150,
    attack: 95,
    defense: 90,
    speed: 60,
    avatar: '/assets/m2.png',
    rarity: 'epic',
    shield: 0,
    mods: [],
    status: [],
    abilities: [
      {
        id: 'metal_slam',
        name: 'Metal Slam',
        description: 'Crushes opponent with recycled metal force',
        damage: 30,
        energyCost: 1,
        type: 'attack',
        element: 'metal',
        animation: '🦾💥'
      },
      {
        id: 'alloy_storm',
        name: 'Alloy Storm',
        description: 'Unleashes a storm of metal fragments',
        damage: 50,
        energyCost: 2,
        type: 'attack',
        element: 'metal',
        animation: '⚡🌪️'
      },
      {
        id: 'magnetic_pull',
        name: 'Magnetic Pull',
        description: 'Pulls metal waste to strengthen defense',
        damage: 0,
        energyCost: 1,
        type: 'defense',
        element: 'metal',
        animation: '🧲✨'
      },
      {
        id: 'steel_recovery',
        name: 'Steel Recovery',
        description: 'Repairs damage using scrap metal',
        damage: -25,
        energyCost: 2,
        type: 'heal',
        element: 'metal',
        animation: '🔧💙'
      }
    ]
  },
  {
    id: 'glass_breaker',
    name: 'GlassBreaker Gamma',
    type: 'glass',
    level: 22,
    hp: 100,
    maxHp: 100,
    attack: 110,
    defense: 60,
    speed: 95,
    avatar: '/assets/m3.png',
    rarity: 'legendary',
    shield: 0,
    mods: [],
    status: [],
    abilities: [
      {
        id: 'crystal_shard',
        name: 'Crystal Shard',
        description: 'Launches sharp glass fragments',
        damage: 35,
        energyCost: 1,
        type: 'attack',
        element: 'glass',
        animation: '💎⚡'
      },
      {
        id: 'prism_beam',
        name: 'Prism Beam',
        description: 'Focuses light through glass into a devastating beam',
        damage: 60,
        energyCost: 3,
        type: 'attack',
        element: 'light',
        animation: '🌈💥'
      },
      {
        id: 'mirror_shield',
        name: 'Mirror Shield',
        description: 'Reflects attacks back at opponent',
        damage: 0,
        energyCost: 2,
        type: 'defense',
        element: 'glass',
        animation: '🪞✨'
      },
      {
        id: 'glass_mend',
        name: 'Glass Mend',
        description: 'Reforms broken glass to heal wounds',
        damage: -20,
        energyCost: 1,
        type: 'heal',
        element: 'glass',
        animation: '💎💚'
      }
    ]
  }
];

// Opponent EcoMons (AI controlled)
const OPPONENT_ECOMONS: BattleEcoMon[] = [
  {
    id: 'paper_shredder',
    name: 'PaperShredder Delta',
    type: 'paper',
    level: 12,
    hp: 90,
    maxHp: 90,
    attack: 70,
    defense: 50,
    speed: 85,
    avatar: '/assets/m4.png',
    rarity: 'uncommon',
    shield: 0,
    mods: [],
    status: [],
    abilities: [
      {
        id: 'paper_cut',
        name: 'Paper Cut',
        description: 'Quick slicing attack with paper edges',
        energyCost: 1,
        type: 'attack',
        element: 'paper',
        animation: '📄💨',
        effects: [
          { kind: 'damage', target: 'enemy', value: 15, scale: 0.4 },
          { kind: 'status', target: 'enemy', statusName: 'bleed', value: 3, duration: 2, chance: 0.4 }
        ]
      },
      {
        id: 'pulp_storm',
        name: 'Pulp Storm',
        description: 'Overwhelms opponent with paper pulp',
        energyCost: 2,
        type: 'attack',
        element: 'paper',
        animation: '🌪️📄',
        effects: [
          { kind: 'damage', target: 'enemy', value: 28, scale: 0.6 },
          { kind: 'debuff', target: 'enemy', stat: 'speed', value: 20, duration: 2 }
        ]
      },
      {
        id: 'fiber_bind',
        name: 'Fiber Bind',
        description: 'Binds opponent with paper fibers',
        energyCost: 1,
        type: 'defense',
        element: 'paper',
        animation: '🕸️📄',
        effects: [
          { kind: 'debuff', target: 'enemy', stat: 'speed', value: 25, duration: 1 }
        ]
      },
      {
        id: 'recycle_heal',
        name: 'Recycle Heal',
        description: 'Heals by recycling damaged paper',
        energyCost: 2,
        type: 'heal',
        element: 'nature',
        animation: '♻️💚',
        effects: [
          { kind: 'heal', target: 'self', value: 20, scale: 0.3 }
        ]
      }
    ]
  }
];

interface EcoMonBattleProps {
  onReturnToHub?: () => void;
}

// Helper function to render avatar (handles both images and emojis)
const renderAvatar = (avatar: string, size: string = '80px', additionalStyles: any = {}) => {
  // Check if it's an image path (starts with '/')
  if (avatar.startsWith('/')) {
    return (
      <img
        src={avatar}
        alt="EcoMon"
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: '50%',
          ...additionalStyles
        }}
      />
    );
  }

  // Otherwise render as emoji
  return (
    <div style={{
      fontSize: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...additionalStyles
    }}>
      {avatar}
    </div>
  );
};

// Effects System Helper Functions
function getModifiedStat(mon: BattleEcoMon, stat: Stat) {
  const base = (mon as any)[stat] as number;
  const mods = mon.mods || [];
  const pct = mods.filter(m => m.stat === stat).reduce((a, m) => a + m.amountPct, 0);
  return Math.max(1, Math.floor(base * (1 + pct)));
}

function applyDamage(target: BattleEcoMon, raw: number) {
  let dmg = Math.max(0, raw);
  const shield = target.shield || 0;
  if (shield > 0) {
    const after = Math.max(0, shield - dmg);
    dmg = Math.max(0, dmg - shield);
    target.shield = after;
  }
  target.hp = Math.max(0, target.hp - dmg);
}

function tickStatuses(mon: BattleEcoMon, log: string[]) {
  if (!mon.status || mon.status.length === 0) return;
  const keep: Status[] = [];
  for (const s of mon.status) {
    if (s.name === 'bleed' || s.name === 'rust') {
      const v = s.value || 0;
      if (v > 0) {
        applyDamage(mon, v);
        log.push(`${mon.name} suffers ${v} from ${s.name}.`);
      }
    }
    if (s.name === 'regen') {
      const v = s.value || 0;
      if (v > 0) {
        mon.hp = Math.min((mon as any).maxHp || mon.hp, mon.hp + v);
        log.push(`${mon.name} restores ${v} from regen.`);
      }
    }
    s.turnsLeft -= 1;
    if (s.turnsLeft > 0) keep.push(s);
  }
  mon.status = keep;
}

function isStunned(mon: BattleEcoMon) {
  const has = (mon.status || []).some(s => s.name === 'overload');
  if (has) {
    // consume one turn of overload
    mon.status = (mon.status || []).map(s => s.name==='overload' ? {...s, turnsLeft: s.turnsLeft-1} : s)
                                   .filter(s => s.turnsLeft > 0);
  }
  return has;
}

function applyEffect(
  caster: BattleEcoMon,
  target: BattleEcoMon,
  ef: AbilityEffect,
  abilityElement: string,
  getEff: TypeEffFn,
  log: string[]
) {
  if (ef.chance && Math.random() > ef.chance) return;

  const to = ef.target === 'self' ? caster : target;

  switch (ef.kind) {
    case 'damage': {
      const atk = getModifiedStat(caster, 'attack');
      const def = getModifiedStat(target, 'defense');
      const base = (ef.value || 0) + Math.floor((ef.scale || 0) * atk);
      const eff = getEff((caster as any).type, (target as any).type) || 1;
      const mitigated = Math.max(1, Math.floor(base * eff * (100 / (100 + def))));
      applyDamage(target, mitigated);
      log.push(`${caster.name} hits ${target.name} for ${mitigated}.`);
      break;
    }
    case 'heal': {
      const atk = getModifiedStat(caster, 'attack');
      const val = (ef.value || 0) + Math.floor((ef.scale || 0) * atk);
      to.hp = Math.min((to as any).maxHp || to.hp, to.hp + Math.abs(val));
      log.push(`${caster.name} heals ${to===caster?'self':target.name} for ${Math.abs(val)}.`);
      break;
    }
    case 'shield': {
      to.shield = (to.shield || 0) + (ef.value || 0);
      log.push(`${to.name} gains a ${ef.value || 0} shield.`);
      break;
    }
    case 'buff':
    case 'debuff': {
      const dir = ef.kind === 'debuff' ? -1 : 1;
      const amtPct = (ef.value || 0) / 100 * dir;
      const stat = ef.stat || 'attack';
      const dur = ef.duration || 2;
      to.mods = [...(to.mods || []), { stat, amountPct: amtPct, turnsLeft: dur }];
      log.push(`${to.name} ${dir>0?'gains':'loses'} ${Math.abs(ef.value || 0)}% ${stat} for ${dur} turns.`);
      break;
    }
    case 'status': {
      const name = ef.statusName!;
      const dur = ef.duration || 2;
      const val = ef.value;
      to.status = [...(to.status || []), { name, value: val, turnsLeft: dur }];
      log.push(`${to.name} is afflicted with ${name}${val ? ` (${val}/turn)` : ''}.`);
      break;
    }
    case 'energy': {
      // Optional: handle energy in the battleState updater after this call.
      break;
    }
  }
}

// Type alias for the effectiveness function
type TypeEffFn = (attackerType: string, defenderType: string) => number;

export default function EcoMonBattle({ onReturnToHub }: EcoMonBattleProps = {}) {
  const [battleState, setBattleState] = useState<BattleState>({
    phase: 'selection',
    turn: 'player',
    playerEcoMon: null,
    opponentEcoMon: null,
    playerEnergy: 3,
    opponentEnergy: 3,
    maxEnergy: 3,
    battleLog: [],
    isAnimating: false,
    selectedAbility: null,
    currentRound: 1,
    playerWins: 0,
    opponentWins: 0,
    roundsToWin: 3
  });

  const [availableEcoMons] = useState<BattleEcoMon[]>(BATTLE_ECOMONS);
  const [animationText, setAnimationText] = useState<string>('');
  const [showVictoryMessage, setShowVictoryMessage] = useState(false);

  // Type effectiveness system
  const getTypeEffectiveness = (attackerType: string, defenderType: string): number => {
    const effectiveness: Record<string, Record<string, number>> = {
      plastic: { organic: 1.5, paper: 1.2, metal: 0.8, glass: 0.9 },
      metal: { electronic: 1.5, glass: 1.2, plastic: 1.1, organic: 0.8 },
      glass: { electronic: 1.3, metal: 1.1, paper: 1.4, plastic: 0.9 },
      paper: { plastic: 0.8, organic: 1.3, glass: 0.7, metal: 0.6 },
      organic: { paper: 1.2, plastic: 0.7, metal: 1.1, glass: 1.0 },
      electronic: { metal: 0.8, glass: 0.9, plastic: 1.1, paper: 1.3 }
    };

    return effectiveness[attackerType]?.[defenderType] || 1.0;
  };

  const getRarityColor = (rarity: string): string => {
    const colors = {
      common: '#9E9E9E',
      uncommon: '#4CAF50',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FF9800'
    };
    return colors[rarity as keyof typeof colors] || '#9E9E9E';
  };

  const getTypeColor = (type: string): string => {
    const colors = {
      plastic: '#4CAF50',
      metal: '#607D8B',
      glass: '#03A9F4',
      paper: '#8BC34A',
      organic: '#4CAF50',
      electronic: '#FF9800',
      textile: '#E91E63'
    };
    return colors[type as keyof typeof colors] || '#9E9E9E';
  };

  // Start battle with selected EcoMon
  const startBattle = (selectedEcoMon: BattleEcoMon) => {
    const opponent = OPPONENT_ECOMONS[Math.floor(Math.random() * OPPONENT_ECOMONS.length)];

    setBattleState(prev => ({
      ...prev,
      phase: 'battle',
      playerEcoMon: {
        ...selectedEcoMon,
        shield: selectedEcoMon.shield || 0,
        mods: selectedEcoMon.mods || [],
        status: selectedEcoMon.status || []
      },
      opponentEcoMon: {
        ...opponent,
        shield: opponent.shield || 0,
        mods: opponent.mods || [],
        status: opponent.status || []
      },
      battleLog: [`${selectedEcoMon.name} enters the battle arena!`, `Wild ${opponent.name} appears!`]
    }));
  };

  // Execute ability
  const useAbility = async (ability: BattleAbility) => {
    if (battleState.isAnimating || battleState.playerEnergy < ability.energyCost) return;

    setBattleState(prev => ({ ...prev, isAnimating: true, selectedAbility: ability }));
    setAnimationText(ability.animation);

    // Apply ability effects
    setTimeout(() => {
      setBattleState(prev => {
        if (!prev.playerEcoMon || !prev.opponentEcoMon) return prev;

        const newState = { ...prev };
        const logMessages: string[] = [];

        // Check accuracy
        if (ability.accuracy && Math.random() > ability.accuracy) {
          logMessages.push(`${prev.playerEcoMon.name}'s ${ability.name} missed!`);
        } else if (ability.effects && ability.effects.length) {
          // Use effects system
          for (const ef of ability.effects) {
            applyEffect(prev.playerEcoMon, prev.opponentEcoMon, ef, ability.element, getTypeEffectiveness, logMessages);
          }
        } else {
          // Fallback: old single-hit damage calc
          const atk = getModifiedStat(prev.playerEcoMon, 'attack');
          const def = getModifiedStat(prev.opponentEcoMon, 'defense');
          const base = ability.damage ?? 25;
          const eff = getTypeEffectiveness(prev.playerEcoMon.type, prev.opponentEcoMon.type) ?? 1;
          const mitigated = Math.max(1, Math.floor(base * eff * (100 / (100 + def))));
          applyDamage(prev.opponentEcoMon, mitigated);
          logMessages.push(`${prev.playerEcoMon.name} used ${ability.name}! Dealt ${mitigated} damage.`);
        }

        newState.playerEnergy = prev.playerEnergy - ability.energyCost;
        newState.battleLog = [...prev.battleLog, ...logMessages];
        newState.turn = 'opponent';
        newState.isAnimating = false;
        newState.selectedAbility = null;

        // Check for round victory
        if (newState.opponentEcoMon!.hp <= 0) {
          newState.playerWins += 1;
          newState.battleLog = [...newState.battleLog, `${prev.opponentEcoMon!.name} fainted! Round ${newState.currentRound} won!`];

          // Check if player has won enough rounds for overall victory
          if (newState.playerWins >= newState.roundsToWin) {
            newState.phase = 'victory';
            newState.battleLog = [...newState.battleLog, `Victory! You won ${newState.playerWins} out of ${newState.currentRound} rounds!`];
            setShowVictoryMessage(true);
          } else {
            // Start next round
            newState.currentRound += 1;
            newState.battleLog = [...newState.battleLog, `Starting Round ${newState.currentRound}...`];
            // Reset EcoMon HP for next round
            newState.playerEcoMon!.hp = newState.playerEcoMon!.maxHp;
            newState.opponentEcoMon!.hp = newState.opponentEcoMon!.maxHp;
            // Reset energy
            newState.playerEnergy = newState.maxEnergy;
            newState.opponentEnergy = newState.maxEnergy;
          }
        }

        return newState;
      });

      setAnimationText('');
    }, 1500);

    // Status ticks for both sides at end of player turn
    setTimeout(() => {
      setBattleState(prev => {
        if (!prev.playerEcoMon || !prev.opponentEcoMon) return prev;

        const newState = { ...prev };
        const statusMessages: string[] = [];

        tickStatuses(prev.playerEcoMon, statusMessages);
        tickStatuses(prev.opponentEcoMon, statusMessages);

        newState.battleLog = [...prev.battleLog, ...statusMessages];

        return newState;
      });

      // AI turn after delay (only if opponent is not stunned)
    if (battleState.opponentEcoMon && battleState.opponentEcoMon.hp > 0) {
      setTimeout(() => {
        aiTurn();
      }, 3000);
    }
    }, 2000);
  };

  // AI opponent turn
  const aiTurn = () => {
    if (!battleState.opponentEcoMon || !battleState.playerEcoMon) return;

    // Check if opponent is stunned (overload)
    if (isStunned(battleState.opponentEcoMon)) {
      setBattleState(prev => ({
        ...prev,
        battleLog: [...prev.battleLog, `${prev.opponentEcoMon!.name} is stunned and skips the turn!`],
        turn: 'player',
        playerEnergy: Math.min(prev.maxEnergy, prev.playerEnergy + 1),
        opponentEnergy: Math.min(prev.maxEnergy, prev.opponentEnergy + 1)
      }));

      // Status ticks and end turn
      setTimeout(() => {
        setBattleState(prev => {
          if (!prev.playerEcoMon || !prev.opponentEcoMon) return prev;

          const newState = { ...prev };
          const statusMessages: string[] = [];

          tickStatuses(prev.playerEcoMon, statusMessages);
          tickStatuses(prev.opponentEcoMon, statusMessages);

          newState.battleLog = [...prev.battleLog, ...statusMessages];

          return newState;
        });
      }, 1000);

      return;
    }

    const availableAbilities = battleState.opponentEcoMon.abilities.filter(
      ability => battleState.opponentEnergy >= ability.energyCost
    );

    if (availableAbilities.length === 0) {
      // Skip turn if no energy
      setBattleState(prev => ({
        ...prev,
        turn: 'player',
        playerEnergy: Math.min(prev.maxEnergy, prev.playerEnergy + 1),
        opponentEnergy: Math.min(prev.maxEnergy, prev.opponentEnergy + 1),
        battleLog: [...prev.battleLog, `${prev.opponentEcoMon!.name} is recharging energy...`]
      }));
      return;
    }

    const selectedAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];

    setBattleState(prev => ({ ...prev, isAnimating: true }));
    setAnimationText(selectedAbility.animation);

    setTimeout(() => {
      setBattleState(prev => {
        if (!prev.playerEcoMon || !prev.opponentEcoMon) return prev;

        const newState = { ...prev };
        const logMessages: string[] = [];

        // Check accuracy
        if (selectedAbility.accuracy && Math.random() > selectedAbility.accuracy) {
          logMessages.push(`${prev.opponentEcoMon.name}'s ${selectedAbility.name} missed!`);
        } else if (selectedAbility.effects && selectedAbility.effects.length) {
          // Use effects system
          for (const ef of selectedAbility.effects) {
            applyEffect(prev.opponentEcoMon, prev.playerEcoMon, ef, selectedAbility.element, getTypeEffectiveness, logMessages);
          }
        } else {
          // Fallback: old single-hit damage calc
          const atk = getModifiedStat(prev.opponentEcoMon, 'attack');
          const def = getModifiedStat(prev.playerEcoMon, 'defense');
          const base = selectedAbility.damage ?? 20;
          const eff = getTypeEffectiveness(prev.opponentEcoMon.type, prev.playerEcoMon.type) ?? 1;
          const mitigated = Math.max(1, Math.floor(base * eff * (100 / (100 + def))));
          applyDamage(prev.playerEcoMon, mitigated);
          logMessages.push(`${prev.opponentEcoMon.name} used ${selectedAbility.name}! Dealt ${mitigated} damage.`);
        }

        newState.opponentEnergy = prev.opponentEnergy - selectedAbility.energyCost;
        newState.battleLog = [...prev.battleLog, ...logMessages];
        newState.turn = 'player';
        newState.isAnimating = false;
        newState.playerEnergy = Math.min(prev.maxEnergy, prev.playerEnergy + 1);
        newState.opponentEnergy = Math.min(prev.maxEnergy, newState.opponentEnergy + 1);

        // Check for round defeat
        if (newState.playerEcoMon!.hp <= 0) {
          newState.opponentWins += 1;
          newState.battleLog = [...newState.battleLog, `${prev.playerEcoMon!.name} fainted! Round ${newState.currentRound} lost!`];

          // Check if opponent has won enough rounds for overall victory
          if (newState.opponentWins >= newState.roundsToWin) {
            newState.phase = 'defeat';
            newState.battleLog = [...newState.battleLog, `Defeat! You lost ${newState.opponentWins} out of ${newState.currentRound} rounds!`];
          } else {
            // Start next round
            newState.currentRound += 1;
            newState.battleLog = [...newState.battleLog, `Starting Round ${newState.currentRound}...`];
            // Reset EcoMon HP for next round
            newState.playerEcoMon!.hp = newState.playerEcoMon!.maxHp;
            newState.opponentEcoMon!.hp = newState.opponentEcoMon!.maxHp;
            // Reset energy
            newState.playerEnergy = newState.maxEnergy;
            newState.opponentEnergy = newState.maxEnergy;
          }
        }

        return newState;
      });

      setAnimationText('');
    }, 1500);

    // Status ticks for both sides at end of AI turn
    setTimeout(() => {
      setBattleState(prev => {
        if (!prev.playerEcoMon || !prev.opponentEcoMon) return prev;

        const newState = { ...prev };
        const statusMessages: string[] = [];

        tickStatuses(prev.playerEcoMon, statusMessages);
        tickStatuses(prev.opponentEcoMon, statusMessages);

        newState.battleLog = [...prev.battleLog, ...statusMessages];

        return newState;
      });
    }, 2000);
  };

  // Reset battle
  const resetBattle = () => {
    setBattleState({
      phase: 'selection',
      turn: 'player',
      playerEcoMon: null,
      opponentEcoMon: null,
      playerEnergy: 3,
      opponentEnergy: 3,
      maxEnergy: 3,
      battleLog: [],
      isAnimating: false,
      selectedAbility: null,
      currentRound: 1,
      playerWins: 0,
      opponentWins: 0,
      roundsToWin: 3
    });
    setShowVictoryMessage(false);
    setAnimationText('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      color: 'white',
      paddingBottom: '0px',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(255,255,255,0.03) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* EcoMon Selection Phase */}
      {battleState.phase === 'selection' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{
            background: 'rgba(255,107,53,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            margin: '20px',
            padding: '24px 20px',
            textAlign: 'center'
          }}>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '28px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontWeight: 'bold'
            }}>
              ⚔️ EcoMon Battle Arena
            </h1>
            <p style={{
              margin: 0,
              opacity: 0.9,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              Choose your EcoMon to battle!
            </p>
          </div>

          {/* EcoMon Selection Grid */}
          <div style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {availableEcoMons.map((ecomon) => (
              <div
                key={ecomon.id}
                onClick={() => startBattle(ecomon)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '24px',
                  cursor: 'pointer',
                  border: `2px solid ${getRarityColor(ecomon.rarity)}`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: `0 8px 32px ${getRarityColor(ecomon.rarity)}40`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 16px 48px ${getRarityColor(ecomon.rarity)}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 8px 32px ${getRarityColor(ecomon.rarity)}40`;
                }}
              >
                {/* EcoMon Avatar */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 16px',
                  filter: `drop-shadow(0 4px 8px ${getRarityColor(ecomon.rarity)}80)`
                }}>
                  {renderAvatar(ecomon.avatar, '80px')}
                </div>

                {/* EcoMon Info */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '24px',
                    color: getRarityColor(ecomon.rarity),
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {ecomon.name}
                  </h3>
                  <div style={{
                    background: getTypeColor(ecomon.type),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {ecomon.type}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}>
                    Level {ecomon.level}
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#e74c3c',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      {ecomon.hp}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      opacity: 0.9,
                      color: 'white',
                      fontWeight: '600'
                    }}>HP</div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#f39c12',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      {ecomon.attack}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      opacity: 0.9,
                      color: 'white',
                      fontWeight: '600'
                    }}>ATK</div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#3498db',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      {ecomon.defense}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      opacity: 0.9,
                      color: 'white',
                      fontWeight: '600'
                    }}>DEF</div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#2ecc71',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      {ecomon.speed}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      opacity: 0.9,
                      color: 'white',
                      fontWeight: '600'
                    }}>SPD</div>
                  </div>
                </div>

                {/* Abilities Preview */}
                <div>
                  <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    opacity: 0.9,
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    Abilities:
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px'
                  }}>
                    {ecomon.abilities.slice(0, 2).map((ability) => (
                      <span
                        key={ability.id}
                        style={{
                          background: 'rgba(255,255,255,0.3)',
                          backdropFilter: 'blur(5px)',
                          border: '1px solid rgba(255,255,255,0.4)',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          color: 'white',
                          fontWeight: '600'
                        }}
                      >
                        {ability.name}
                      </span>
                    ))}
                    {ecomon.abilities.length > 2 && (
                      <span style={{
                        background: 'rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255,255,255,0.4)',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        color: 'white',
                        fontWeight: '600'
                      }}>
                        +{ecomon.abilities.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Battle Button */}
                <button
                  style={{
                    width: '100%',
                    background: `linear-gradient(135deg, ${getRarityColor(ecomon.rarity)}, ${getRarityColor(ecomon.rarity)}CC)`,
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginTop: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 15px ${getRarityColor(ecomon.rarity)}40`,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 25px ${getRarityColor(ecomon.rarity)}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 15px ${getRarityColor(ecomon.rarity)}40`;
                  }}
                >
                  ⚔️ BATTLE WITH {ecomon.name.toUpperCase()}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Battle Phase */}
      {battleState.phase === 'battle' && battleState.playerEcoMon && battleState.opponentEcoMon && (
        <div style={{
          background: 'transparent',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Battle Arena Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(255,107,53,0.2) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)
            `,
            pointerEvents: 'none'
          }} />

          {/* Animation Overlay */}
          {animationText && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '80px',
              zIndex: 1000,
              animation: 'battleAnimation 1.5s ease-out',
              pointerEvents: 'none'
            }}>
              {animationText}
            </div>
          )}

          {/* Round Counter */}
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,215,0,0.5)',
            borderRadius: '16px',
            padding: '8px 16px',
            zIndex: 100,
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>Round</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1c40f' }}>
              {battleState.currentRound}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
              You: {battleState.playerWins} | Opp: {battleState.opponentWins}
            </div>
          </div>

          {/* Opponent EcoMon */}
          <div style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            textAlign: 'center',
            transform: battleState.turn === 'opponent' && battleState.isAnimating ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 16px',
              filter: `drop-shadow(0 8px 16px ${getRarityColor(battleState.opponentEcoMon.rarity)}80)`
            }}>
              {renderAvatar(battleState.opponentEcoMon.avatar, '120px')}
            </div>

            {/* Opponent Info */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '12px 16px',
              borderRadius: '16px',
              border: `2px solid ${getRarityColor(battleState.opponentEcoMon.rarity)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: getRarityColor(battleState.opponentEcoMon.rarity) }}>
                {battleState.opponentEcoMon.name}
              </h3>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                Level {battleState.opponentEcoMon.level}
              </div>

              {/* HP Bar */}
              <div style={{ marginBottom: '8px', position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  marginBottom: '4px'
                }}>
                  <span>HP</span>
                  <span>{battleState.opponentEcoMon.hp} / {battleState.opponentEcoMon.maxHp}</span>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  height: '8px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    background: battleState.opponentEcoMon.hp > battleState.opponentEcoMon.maxHp * 0.5 ? '#2ecc71' :
                               battleState.opponentEcoMon.hp > battleState.opponentEcoMon.maxHp * 0.2 ? '#f39c12' : '#e74c3c',
                    height: '100%',
                    width: `${(battleState.opponentEcoMon.hp / battleState.opponentEcoMon.maxHp) * 100}%`,
                    transition: 'width 0.5s ease, background-color 0.3s ease'
                  }} />
                  {/* Shield overlay */}
                  {battleState.opponentEcoMon.shield && battleState.opponentEcoMon.shield > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${Math.min(100, (battleState.opponentEcoMon.shield / battleState.opponentEcoMon.maxHp) * 100)}%`,
                      background: 'rgba(52, 152, 219, 0.7)',
                      borderRadius: '4px',
                      boxShadow: '0 0 8px rgba(52, 152, 219, 0.5)'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-15px',
                        right: '2px',
                        fontSize: '10px',
                        color: '#3498db',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}>
                        🛡️{battleState.opponentEcoMon.shield}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Effects */}
              {battleState.opponentEcoMon.status && battleState.opponentEcoMon.status.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  {battleState.opponentEcoMon.status.map((status, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        background: status.name === 'bleed' ? 'rgba(231, 76, 60, 0.8)' :
                                   status.name === 'regen' ? 'rgba(46, 204, 113, 0.8)' :
                                   status.name === 'overload' ? 'rgba(155, 89, 182, 0.8)' :
                                   status.name === 'rust' ? 'rgba(149, 165, 166, 0.8)' :
                                   'rgba(255, 255, 255, 0.8)',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      title={`${status.name}${status.value ? ` (${status.value}/turn)` : ''} - ${status.turnsLeft} turns`}
                    >
                      {status.name === 'bleed' ? '🩸' :
                       status.name === 'regen' ? '🌿' :
                       status.name === 'overload' ? '💫' :
                       status.name === 'rust' ? '🧲' :
                       status.name === 'crack' ? '🪩' : '?'}
                    </div>
                  ))}
                </div>
              )}

              {/* Energy */}
              <div style={{
                display: 'flex',
                gap: '4px',
                justifyContent: 'center'
              }}>
                {Array.from({ length: battleState.maxEnergy }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: i < battleState.opponentEnergy ? '#3498db' : 'rgba(255,255,255,0.2)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Player EcoMon */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            textAlign: 'center',
            transform: battleState.turn === 'player' && battleState.isAnimating ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 16px',
              filter: `drop-shadow(0 8px 16px ${getRarityColor(battleState.playerEcoMon.rarity)}80)`
            }}>
              {renderAvatar(battleState.playerEcoMon.avatar, '120px')}
            </div>

            {/* Player Info */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '12px 16px',
              borderRadius: '16px',
              border: `2px solid ${getRarityColor(battleState.playerEcoMon.rarity)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: getRarityColor(battleState.playerEcoMon.rarity) }}>
                {battleState.playerEcoMon.name}
              </h3>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                Level {battleState.playerEcoMon.level}
              </div>

              {/* HP Bar */}
              <div style={{ marginBottom: '8px', position: 'relative' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  marginBottom: '4px'
                }}>
                  <span>HP</span>
                  <span>{battleState.playerEcoMon.hp} / {battleState.playerEcoMon.maxHp}</span>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  height: '8px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    background: battleState.playerEcoMon.hp > battleState.playerEcoMon.maxHp * 0.5 ? '#2ecc71' :
                               battleState.playerEcoMon.hp > battleState.playerEcoMon.maxHp * 0.2 ? '#f39c12' : '#e74c3c',
                    height: '100%',
                    width: `${(battleState.playerEcoMon.hp / battleState.playerEcoMon.maxHp) * 100}%`,
                    transition: 'width 0.5s ease, background-color 0.3s ease'
                  }} />
                  {/* Shield overlay */}
                  {battleState.playerEcoMon.shield && battleState.playerEcoMon.shield > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${Math.min(100, (battleState.playerEcoMon.shield / battleState.playerEcoMon.maxHp) * 100)}%`,
                      background: 'rgba(52, 152, 219, 0.7)',
                      borderRadius: '4px',
                      boxShadow: '0 0 8px rgba(52, 152, 219, 0.5)'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-15px',
                        right: '2px',
                        fontSize: '10px',
                        color: '#3498db',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}>
                        🛡️{battleState.playerEcoMon.shield}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Effects */}
              {battleState.playerEcoMon.status && battleState.playerEcoMon.status.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  {battleState.playerEcoMon.status.map((status, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        background: status.name === 'bleed' ? 'rgba(231, 76, 60, 0.8)' :
                                   status.name === 'regen' ? 'rgba(46, 204, 113, 0.8)' :
                                   status.name === 'overload' ? 'rgba(155, 89, 182, 0.8)' :
                                   status.name === 'rust' ? 'rgba(149, 165, 166, 0.8)' :
                                   'rgba(255, 255, 255, 0.8)',
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      title={`${status.name}${status.value ? ` (${status.value}/turn)` : ''} - ${status.turnsLeft} turns`}
                    >
                      {status.name === 'bleed' ? '🩸' :
                       status.name === 'regen' ? '🌿' :
                       status.name === 'overload' ? '💫' :
                       status.name === 'rust' ? '🧲' :
                       status.name === 'crack' ? '🪩' : '?'}
                    </div>
                  ))}
                </div>
              )}

              {/* Energy */}
              <div style={{
                display: 'flex',
                gap: '4px',
                justifyContent: 'center'
              }}>
                {Array.from({ length: battleState.maxEnergy }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: i < battleState.playerEnergy ? '#3498db' : 'rgba(255,255,255,0.2)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Turn Indicator */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: battleState.turn === 'player' ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${battleState.turn === 'player' ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`,
            color: 'white',
            padding: '12px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            {battleState.turn === 'player' ? '🎮 Your Turn' : '🤖 Opponent Turn'}
          </div>

          {/* Battle Controls */}
          {battleState.turn === 'player' && !battleState.isAnimating && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <h4 style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#FF6B35' }}>
                Choose an Ability
              </h4>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {battleState.playerEcoMon.abilities.map((ability) => {
                  const canUse = battleState.playerEnergy >= ability.energyCost;
                  const handleAbilityClick = () => {
                    if (canUse) {
                      useAbility(ability);
                    }
                  };

                  return (
                    <button
                      key={ability.id}
                      onClick={handleAbilityClick}
                      disabled={!canUse}
                      style={{
                        background: canUse ?
                          `linear-gradient(135deg, ${getTypeColor(ability.element)}, ${getTypeColor(ability.element)}CC)` :
                          'rgba(255,255,255,0.1)',
                        color: canUse ? 'white' : 'rgba(255,255,255,0.5)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: canUse ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {ability.name}
                        </span>
                        <span style={{
                          background: 'rgba(255,255,255,0.2)',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px'
                        }}>
                          {ability.energyCost} ⚡
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>
                        {ability.description}
                      </div>
                      {ability.type === 'attack' && (
                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#e74c3c' }}>
                          💥 {ability.damage} damage
                        </div>
                      )}
                      {ability.type === 'heal' && (
                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#2ecc71' }}>
                          💚 {Math.abs(ability.damage)} heal
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Battle Log */}
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '12px',
            maxHeight: '120px',
            overflowY: 'auto',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            {battleState.battleLog.slice(-3).map((log, index) => (
              <div
                key={index}
                style={{
                  fontSize: '12px',
                  marginBottom: '4px',
                  opacity: index === battleState.battleLog.slice(-3).length - 1 ? 1 : 0.7
                }}
              >
                {log}
              </div>
            ))}
          </div>

          {/* Our Monster Icon - Bottom Left */}
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 1000
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '3px solid #f1c40f',
              boxShadow: '0 4px 12px rgba(241,196,15,0.4)',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img
                src="/assets/noob.jpg"
                alt="Your Monster"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '4px',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 'bold',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              YOU
            </div>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {battleState.phase === 'victory' && battleState.playerEcoMon && battleState.opponentEcoMon && (
        <div style={{
          background: 'transparent',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          padding: '20px'
        }}>
          {/* Victory Animation Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%),
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)
            `,
            animation: 'victoryPulse 2s infinite',
            pointerEvents: 'none'
          }} />

          {/* Victory Content Card */}
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '400px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            {/* Victory Icon */}
            <div style={{
              fontSize: '100px',
              marginBottom: '24px',
              animation: 'bounce 1s infinite'
            }}>
              🏆
            </div>

            <h1 style={{
              margin: '0 0 16px 0',
              fontSize: '32px',
              color: '#f1c40f',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              VICTORY!
            </h1>

            <p style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              color: 'white'
            }}>
              {battleState.playerEcoMon.name} defeated {battleState.opponentEcoMon.name}!
            </p>

            <div style={{
              background: 'rgba(241,196,15,0.2)',
              border: '1px solid rgba(241,196,15,0.5)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f1c40f', marginBottom: '8px' }}>
                Battle Results
              </div>
              <div style={{ fontSize: '14px', color: 'white' }}>
                Won {battleState.playerWins} out of {battleState.currentRound} rounds
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                Final Score: You {battleState.playerWins} - {battleState.opponentWins} Opponent
              </div>
            </div>

            {/* Battle Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#f1c40f' }}>Battle Rewards</h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: 'rgba(46,204,113,0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
                    +{Math.floor(battleState.opponentEcoMon.level * 50)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'white' }}>EcoPoints</div>
                </div>

                <div style={{
                  background: 'rgba(52,152,219,0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
                    +{Math.floor(battleState.opponentEcoMon.level * 5)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'white' }}>EcoTokens</div>
                </div>
              </div>

              <div style={{
                background: 'rgba(155,89,182,0.3)',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9b59b6' }}>
                  +{Math.floor(battleState.opponentEcoMon.level * 10)} XP
                </div>
                <div style={{ fontSize: '12px', color: 'white' }}>Experience Points</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={resetBattle}
                style={{
                  background: 'linear-gradient(135deg, #3498db, #2980b9)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🔄 Battle Again
              </button>

              <button
                onClick={() => onReturnToHub ? onReturnToHub() : window.history.back()}
                style={{
                  background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🎮 Return to Game Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defeat Screen */}
      {battleState.phase === 'defeat' && battleState.playerEcoMon && battleState.opponentEcoMon && (
        <div style={{
          background: 'transparent',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(231,76,60,0.2) 0%, transparent 50%)
            `,
            pointerEvents: 'none'
          }} />

          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            {/* Defeat Icon */}
            <div style={{
              fontSize: '100px',
              marginBottom: '24px',
              opacity: 0.8
            }}>
              💔
            </div>

            <h1 style={{
              margin: '0 0 16px 0',
              fontSize: '32px',
              color: '#e74c3c',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              DEFEAT
            </h1>

            <p style={{
              margin: '0 0 24px 0',
              fontSize: '18px',
              color: 'white'
            }}>
              {battleState.playerEcoMon.name} was defeated by {battleState.opponentEcoMon.name}...
            </p>

            {/* Consolation Rewards */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#f39c12' }}>Participation Rewards</h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                <div style={{
                  background: 'rgba(46,204,113,0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ecc71' }}>
                    +{Math.floor(battleState.opponentEcoMon.level * 10)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'white' }}>EcoPoints</div>
                </div>

                <div style={{
                  background: 'rgba(155,89,182,0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9b59b6' }}>
                    +{Math.floor(battleState.opponentEcoMon.level * 2)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'white' }}>XP</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={resetBattle}
                style={{
                  background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🔄 Try Again
              </button>

              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🗺️ Return to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes battleAnimation {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes victoryPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
