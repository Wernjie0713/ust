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
}

interface BattleAbility {
  id: string;
  name: string;
  description: string;
  damage: number;
  energyCost: number;
  type: 'attack' | 'defense' | 'heal' | 'special';
  element: string;
  animation: string;
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
    avatar: '🦎',
    rarity: 'rare',
    abilities: [
      {
        id: 'plastic_chomp',
        name: 'Plastic Chomp',
        description: 'Devours plastic waste to deal damage',
        damage: 25,
        energyCost: 1,
        type: 'attack',
        element: 'plastic',
        animation: '🦎💥'
      },
      {
        id: 'polymer_blast',
        name: 'Polymer Blast',
        description: 'Explosive polymer breakdown attack',
        damage: 45,
        energyCost: 2,
        type: 'attack',
        element: 'plastic',
        animation: '💥🌪️'
      },
      {
        id: 'eco_shield',
        name: 'Eco Shield',
        description: 'Creates a protective barrier from recycled materials',
        damage: 0,
        energyCost: 1,
        type: 'defense',
        element: 'neutral',
        animation: '🛡️✨'
      },
      {
        id: 'regenerate',
        name: 'Regenerate',
        description: 'Heals by absorbing environmental energy',
        damage: -30,
        energyCost: 2,
        type: 'heal',
        element: 'nature',
        animation: '🌱💚'
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
    avatar: '🦾',
    rarity: 'epic',
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
    avatar: '💎',
    rarity: 'legendary',
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
    avatar: '📄',
    rarity: 'uncommon',
    abilities: [
      {
        id: 'paper_cut',
        name: 'Paper Cut',
        description: 'Quick slicing attack with paper edges',
        damage: 20,
        energyCost: 1,
        type: 'attack',
        element: 'paper',
        animation: '📄💨'
      },
      {
        id: 'pulp_storm',
        name: 'Pulp Storm',
        description: 'Overwhelms opponent with paper pulp',
        damage: 35,
        energyCost: 2,
        type: 'attack',
        element: 'paper',
        animation: '🌪️📄'
      },
      {
        id: 'fiber_bind',
        name: 'Fiber Bind',
        description: 'Binds opponent with paper fibers',
        damage: 0,
        energyCost: 1,
        type: 'defense',
        element: 'paper',
        animation: '🕸️📄'
      },
      {
        id: 'recycle_heal',
        name: 'Recycle Heal',
        description: 'Heals by recycling damaged paper',
        damage: -25,
        energyCost: 2,
        type: 'heal',
        element: 'nature',
        animation: '♻️💚'
      }
    ]
  }
];

interface EcoMonBattleProps {
  onReturnToHub?: () => void;
}

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
      playerEcoMon: { ...selectedEcoMon },
      opponentEcoMon: { ...opponent },
      battleLog: [`${selectedEcoMon.name} enters the battle arena!`, `Wild ${opponent.name} appears!`]
    }));
  };

  // Execute ability
  const useAbility = async (ability: BattleAbility) => {
    if (battleState.isAnimating || battleState.playerEnergy < ability.energyCost) return;

    setBattleState(prev => ({ ...prev, isAnimating: true, selectedAbility: ability }));
    setAnimationText(ability.animation);

    // Calculate damage
    let damage = ability.damage;
    if (ability.type === 'attack' && battleState.playerEcoMon && battleState.opponentEcoMon) {
      const effectiveness = getTypeEffectiveness(battleState.playerEcoMon.type, battleState.opponentEcoMon.type);
      damage = Math.floor(damage * effectiveness);
    }

    // Apply ability effect
    setTimeout(() => {
      setBattleState(prev => {
        if (!prev.playerEcoMon || !prev.opponentEcoMon) return prev;

        const newState = { ...prev };
        let logMessage = '';

        if (ability.type === 'attack') {
          newState.opponentEcoMon!.hp = Math.max(0, prev.opponentEcoMon!.hp - damage);
          logMessage = `${prev.playerEcoMon.name} used ${ability.name}! Dealt ${damage} damage!`;
        } else if (ability.type === 'heal') {
          const healAmount = Math.abs(damage);
          newState.playerEcoMon!.hp = Math.min(prev.playerEcoMon!.maxHp, prev.playerEcoMon!.hp + healAmount);
          logMessage = `${prev.playerEcoMon.name} used ${ability.name}! Restored ${healAmount} HP!`;
        } else if (ability.type === 'defense') {
          logMessage = `${prev.playerEcoMon.name} used ${ability.name}! Defense increased!`;
        }

        newState.playerEnergy = prev.playerEnergy - ability.energyCost;
        newState.battleLog = [...prev.battleLog, logMessage];
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

    // AI turn after delay
    if (battleState.opponentEcoMon && battleState.opponentEcoMon.hp > 0) {
      setTimeout(() => {
        aiTurn();
      }, 3000);
    }
  };

  // AI opponent turn
  const aiTurn = () => {
    if (!battleState.opponentEcoMon || !battleState.playerEcoMon) return;

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
        let damage = selectedAbility.damage;
        let logMessage = '';

        if (selectedAbility.type === 'attack') {
          const effectiveness = getTypeEffectiveness(prev.opponentEcoMon.type, prev.playerEcoMon.type);
          damage = Math.floor(damage * effectiveness);
          newState.playerEcoMon!.hp = Math.max(0, prev.playerEcoMon!.hp - damage);
          logMessage = `${prev.opponentEcoMon.name} used ${selectedAbility.name}! Dealt ${damage} damage!`;
        } else if (selectedAbility.type === 'heal') {
          const healAmount = Math.abs(damage);
          newState.opponentEcoMon!.hp = Math.min(prev.opponentEcoMon!.maxHp, prev.opponentEcoMon!.hp + healAmount);
          logMessage = `${prev.opponentEcoMon.name} used ${selectedAbility.name}! Restored ${healAmount} HP!`;
        }

        newState.opponentEnergy = prev.opponentEnergy - selectedAbility.energyCost;
        newState.battleLog = [...prev.battleLog, logMessage];
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
                  fontSize: '80px',
                  textAlign: 'center',
                  marginBottom: '16px',
                  filter: `drop-shadow(0 4px 8px ${getRarityColor(ecomon.rarity)}80)`
                }}>
                  {ecomon.avatar}
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
              fontSize: '120px',
              marginBottom: '16px',
              filter: `drop-shadow(0 8px 16px ${getRarityColor(battleState.opponentEcoMon.rarity)}80)`
            }}>
              {battleState.opponentEcoMon.avatar}
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
              <div style={{ marginBottom: '8px' }}>
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
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: battleState.opponentEcoMon.hp > battleState.opponentEcoMon.maxHp * 0.5 ? '#2ecc71' :
                               battleState.opponentEcoMon.hp > battleState.opponentEcoMon.maxHp * 0.2 ? '#f39c12' : '#e74c3c',
                    height: '100%',
                    width: `${(battleState.opponentEcoMon.hp / battleState.opponentEcoMon.maxHp) * 100}%`,
                    transition: 'width 0.5s ease, background-color 0.3s ease'
                  }} />
                </div>
              </div>

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
              fontSize: '120px',
              marginBottom: '16px',
              filter: `drop-shadow(0 8px 16px ${getRarityColor(battleState.playerEcoMon.rarity)}80)`
            }}>
              {battleState.playerEcoMon.avatar}
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
              <div style={{ marginBottom: '8px' }}>
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
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: battleState.playerEcoMon.hp > battleState.playerEcoMon.maxHp * 0.5 ? '#2ecc71' :
                               battleState.playerEcoMon.hp > battleState.playerEcoMon.maxHp * 0.2 ? '#f39c12' : '#e74c3c',
                    height: '100%',
                    width: `${(battleState.playerEcoMon.hp / battleState.playerEcoMon.maxHp) * 100}%`,
                    transition: 'width 0.5s ease, background-color 0.3s ease'
                  }} />
                </div>
              </div>

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
                src="/assets/noob.jpeg"
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
