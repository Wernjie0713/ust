'use client'

import React, { useState, useEffect } from 'react';
import EcoMonBattle from './EcoMonBattle';
import SocialBattle from './SocialBattle';
import EducationGame from './EducationGame';

interface EcoMon {
  id: string;
  ecoMonId: string;
  name: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  level: number;
  experience: number;
  captureDate: string;
  captureLocation: {
    latitude: number;
    longitude: number;
    name: string;
  };
  stats: {
    recyclingPower: number;
    ecoEfficiency: number;
    wasteCapacity: number;
    evolutionStage: number;
  };
  abilities: string[];
  wasteTypeAffinity: string;
  totalRecycled: {
    items: number;
    weight: number;
  };
}

interface GameHubProps {
  onViewChange?: (view: 'dashboard' | 'collection' | 'battle' | 'social' | 'education') => void;
}

// Sample EcoMons data
const SAMPLE_ECOMONS: EcoMon[] = [
  {
    id: 'ecomon_001',
    ecoMonId: 'ecomon_001_uuid',
    name: 'PlasticEater',
    type: 'plastic',
    rarity: 'common',
    level: 5,
    experience: 250,
    captureDate: '2024-07-15T10:30:00Z',
    captureLocation: {
      latitude: 3.15833,
      longitude: 101.71187,
      name: 'KLCC Recycling Station'
    },
    stats: {
      recyclingPower: 45,
      ecoEfficiency: 60,
      wasteCapacity: 30,
      evolutionStage: 1
    },
    abilities: ['Plastic Breakdown', 'Eco Boost'],
    wasteTypeAffinity: 'plastic',
    totalRecycled: {
      items: 127,
      weight: 2540
    }
  },
  {
    id: 'ecomon_002',
    ecoMonId: 'ecomon_002_uuid',
    name: 'MetalCrusher',
    type: 'metal',
    rarity: 'uncommon',
    level: 8,
    experience: 420,
    captureDate: '2024-07-16T14:20:00Z',
    captureLocation: {
      latitude: 3.14769,
      longitude: 101.71014,
      name: 'Bukit Bintang Green Point'
    },
    stats: {
      recyclingPower: 65,
      ecoEfficiency: 55,
      wasteCapacity: 45,
      evolutionStage: 2
    },
    abilities: ['Metal Crush', 'Magnetic Pull', 'Eco Shield'],
    wasteTypeAffinity: 'metal',
    totalRecycled: {
      items: 89,
      weight: 3200
    }
  },
  {
    id: 'ecomon_003',
    ecoMonId: 'ecomon_003_uuid',
    name: 'GlassGuardian',
    type: 'glass',
    rarity: 'rare',
    level: 12,
    experience: 680,
    captureDate: '2024-07-17T09:45:00Z',
    captureLocation: {
      latitude: 3.14906,
      longitude: 101.71396,
      name: 'Pavilion Eco Hub'
    },
    stats: {
      recyclingPower: 80,
      ecoEfficiency: 75,
      wasteCapacity: 55,
      evolutionStage: 3
    },
    abilities: ['Glass Shatter', 'Crystal Shield', 'Transparency', 'Eco Reflect'],
    wasteTypeAffinity: 'glass',
    totalRecycled: {
      items: 156,
      weight: 4100
    }
  },
  {
    id: 'ecomon_004',
    ecoMonId: 'ecomon_004_uuid',
    name: 'PaperShredder',
    type: 'paper',
    rarity: 'common',
    level: 6,
    experience: 310,
    captureDate: '2024-07-18T11:20:00Z',
    captureLocation: {
      latitude: 3.11560,
      longitude: 101.64751,
      name: 'PJ State Library Green Corner'
    },
    stats: {
      recyclingPower: 50,
      ecoEfficiency: 65,
      wasteCapacity: 35,
      evolutionStage: 1
    },
    abilities: ['Paper Cut', 'Document Digest', 'Eco Print'],
    wasteTypeAffinity: 'paper',
    totalRecycled: {
      items: 203,
      weight: 1850
    }
  },
  {
    id: 'ecomon_005',
    ecoMonId: 'ecomon_005_uuid',
    name: 'OrganicComposer',
    type: 'organic',
    rarity: 'epic',
    level: 15,
    experience: 890,
    captureDate: '2024-07-19T07:15:00Z',
    captureLocation: {
      latitude: 3.07319,
      longitude: 101.60700,
      name: 'Sunway Pyramid Eco Station'
    },
    stats: {
      recyclingPower: 95,
      ecoEfficiency: 90,
      wasteCapacity: 70,
      evolutionStage: 4
    },
    abilities: ['Compost Creation', 'Nutrient Boost', 'Growth Accelerator', 'Bio Decompose', 'Soil Enrichment'],
    wasteTypeAffinity: 'organic',
    totalRecycled: {
      items: 278,
      weight: 5600
    }
  }
];

export default function GameHub({ onViewChange }: GameHubProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'collection' | 'battle' | 'social' | 'education'>('dashboard');
  const [ecoMons, setEcoMons] = useState<EcoMon[]>(SAMPLE_ECOMONS);
  const [selectedEcoMon, setSelectedEcoMon] = useState<EcoMon | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleViewChange = (view: 'dashboard' | 'collection' | 'battle' | 'social' | 'education') => {
    setActiveView(view);
    onViewChange?.(view);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedEcoMon) {
        setSelectedEcoMon(null);
      }
    };

    if (selectedEcoMon) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedEcoMon]);

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '#9E9E9E';
      case 'uncommon': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getMonsterImage = (id: string, type: string): string => {
    // Map EcoMon IDs to local monster images
    const imageMap: { [key: string]: string } = {
      'ecomon_001': '/assets/m1.jpeg',
      'ecomon_002': '/assets/m2.jpeg',
      'ecomon_003': '/assets/m3.jpeg',
      'ecomon_004': '/assets/m4.jpeg',
      'ecomon_005': '/assets/m5.jpeg'
    };

    // Return the mapped image or default to m1.jpeg if not found
    return imageMap[id] || '/assets/m1.jpeg';
  };

  const getTypeEmoji = (type: string): string => {
    switch (type) {
      case 'plastic': return '🥤';
      case 'metal': return '🔧';
      case 'glass': return '🍶';
      case 'paper': return '📄';
      case 'organic': return '🍃';
      default: return '♻️';
    }
  };

  // Battle View
  if (activeView === 'battle') {
    return (
      <div style={{
        minHeight: '100vh',
        paddingBottom: '0px', // No space for navigation since it's hidden
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <button
          onClick={() => handleViewChange('dashboard')}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          ×
        </button>
        <EcoMonBattle onReturnToHub={() => handleViewChange('dashboard')} />
      </div>
    );
  }

  // Social View
  if (activeView === 'social') {
    return (
      <div style={{
        minHeight: '100vh',
        paddingBottom: '0px', // No space for navigation since it's hidden
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <button
          onClick={() => handleViewChange('dashboard')}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          ×
        </button>
        <SocialBattle />
      </div>
    );
  }

  // Education View
  if (activeView === 'education') {
    return (
      <div style={{
        minHeight: '100vh',
        paddingBottom: '0px', // No space for navigation since it's hidden
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <button
          onClick={() => handleViewChange('dashboard')}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          ×
        </button>
        <EducationGame onReturnToHub={() => handleViewChange('dashboard')} />
      </div>
    );
  }

  // Collection View
  if (activeView === 'collection') {
    return (
      <div style={{
        minHeight: '100vh',
        paddingBottom: '0px', // No space for navigation since it's hidden
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <button
          onClick={() => handleViewChange('dashboard')}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          ×
        </button>
        
        {/* Collection Header */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '0 0 20px 20px',
          padding: '20px',
          margin: '0 20px 20px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <h1 style={{
            color: 'white',
            textAlign: 'center',
            margin: '0 0 20px 0',
            fontSize: '28px',
            fontWeight: 'bold',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            🎒 My Collection
          </h1>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search your EcoMons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '16px'
            }}
          />
        </div>

        {/* EcoMons Grid */}
        <div style={{ padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '16px'
          }}>
            {ecoMons
              .filter(ecomon =>
                searchTerm === '' || ecomon.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((ecomon) => (
                <div
                  key={ecomon.id}
                  onClick={() => setSelectedEcoMon(ecomon)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
                  }}
                >
                  {/* Rarity Glow */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${getRarityColor(ecomon.rarity)}, transparent)`,
                    borderRadius: '16px 16px 0 0'
                  }} />

                  {/* Monster Image */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    margin: '0 auto 12px auto',
                    border: `3px solid ${getRarityColor(ecomon.rarity)}`,
                    boxShadow: `0 0 20px ${getRarityColor(ecomon.rarity)}40`,
                    background: `linear-gradient(135deg, ${getRarityColor(ecomon.rarity)}20, ${getRarityColor(ecomon.rarity)}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={getMonsterImage(ecomon.id, ecomon.type)}
                      alt={ecomon.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = getTypeEmoji(ecomon.type);
                      }}
                    />
                  </div>

                  <h3 style={{
                    color: 'white',
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {ecomon.name}
                  </h3>

                  <div style={{
                    background: getRarityColor(ecomon.rarity),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    display: 'inline-block'
                  }}>
                    {ecomon.rarity.toUpperCase()}
                  </div>

                  <div style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '14px',
                    marginBottom: '4px'
                  }}>
                    Level {ecomon.level}
                  </div>

                  <div style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '12px'
                  }}>
                    {ecomon.totalRecycled.items} items recycled
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* EcoMon Detail Modal */}
        {selectedEcoMon && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.9)',
              zIndex: 2000,
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedEcoMon(null);
              }
            }}
          >
            <div style={{
              maxWidth: '400px',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}>
              {/* Modal Header */}
              <div style={{
                background: `linear-gradient(135deg, ${getRarityColor(selectedEcoMon.rarity)}, ${getRarityColor(selectedEcoMon.rarity)}88)`,
                color: 'white',
                padding: '24px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <button
                  onClick={() => setSelectedEcoMon(null)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: 'white',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>

                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    background: `linear-gradient(135deg, ${getRarityColor(selectedEcoMon.rarity)}20, ${getRarityColor(selectedEcoMon.rarity)}10)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={getMonsterImage(selectedEcoMon.id, selectedEcoMon.type)}
                      alt={selectedEcoMon.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = getTypeEmoji(selectedEcoMon.type);
                      }}
                    />
                  </div>
                </div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
                  {selectedEcoMon.name}
                </h2>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {selectedEcoMon.rarity.toUpperCase()}
                </div>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span><strong>Level:</strong> {selectedEcoMon.level}</span>
                    <span><strong>Type:</strong> {selectedEcoMon.wasteTypeAffinity}</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Experience:</strong> {selectedEcoMon.experience} XP
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Captured:</strong> {new Date(selectedEcoMon.captureDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Location:</strong> {selectedEcoMon.captureLocation.name}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#2E7D32' }}>Stats</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div><strong>Recycling Power:</strong> {selectedEcoMon.stats.recyclingPower}</div>
                    <div><strong>Eco Efficiency:</strong> {selectedEcoMon.stats.ecoEfficiency}</div>
                    <div><strong>Waste Capacity:</strong> {selectedEcoMon.stats.wasteCapacity}</div>
                    <div><strong>Evolution Stage:</strong> {selectedEcoMon.stats.evolutionStage}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#2E7D32' }}>Abilities</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedEcoMon.abilities.map((ability, index) => (
                      <span
                        key={index}
                        style={{
                          background: '#E8F5E8',
                          color: '#2E7D32',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: '#2E7D32' }}>Recycling Record</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>Items Recycled:</strong> {selectedEcoMon.totalRecycled.items}</div>
                    <div><strong>Total Weight:</strong> {selectedEcoMon.totalRecycled.weight}g</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default Dashboard View
  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '100px',
      position: 'relative',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '0 0 20px 20px',
        padding: '20px',
        margin: '0 20px 20px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          color: 'white',
          textAlign: 'center',
          margin: '0 0 20px 0',
          fontSize: '28px',
          fontWeight: 'bold',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          🎮 Game Hub
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '20px 16px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Silver</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Current Rank</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '20px 16px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🪙</div>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>2,450</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>EcoPoints</div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '20px 16px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💎</div>
            <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>245</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>EcoTokens</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px'
        }}>
          <button
            onClick={() => handleViewChange('collection')}
            style={{
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              border: 'none',
              borderRadius: '20px',
              padding: '24px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(33,150,243,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{ fontSize: '48px' }}>🎒</div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>Collection</h2>
              <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Browse and manage your EcoMons • {ecoMons.length} creatures</p>
            </div>
            <div style={{ fontSize: '24px', opacity: 0.7 }}>→</div>
          </button>

          <button
            onClick={() => handleViewChange('battle')}
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
              border: 'none',
              borderRadius: '20px',
              padding: '24px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(255,107,53,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{ fontSize: '48px' }}>⚔️</div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>Battle Arena</h2>
              <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Fight NPCs and gain experience • 73% win rate</p>
            </div>
            <div style={{ fontSize: '24px', opacity: 0.7 }}>→</div>
          </button>

          <button
            onClick={() => handleViewChange('education')}
            style={{
              background: 'linear-gradient(135deg, #2ECC71, #27AE60)',
              border: 'none',
              borderRadius: '20px',
              padding: '24px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(46,204,113,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{ fontSize: '48px' }}>🎓</div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>Education Quiz</h2>
              <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>Learn recycling facts and earn rewards • 8 topics</p>
            </div>
            <div style={{ fontSize: '24px', opacity: 0.7 }}>→</div>
          </button>

          <button
            onClick={() => handleViewChange('social')}
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '20px',
              padding: '24px',
              color: '#333333',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{ fontSize: '48px' }}>👥</div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold', color: '#333333' }}>Social Battle</h2>
              <p style={{ margin: 0, fontSize: '16px', opacity: 0.7, color: '#666666' }}>Challenge friends and players • 12 friends</p>
            </div>
            <div style={{ fontSize: '24px', opacity: 0.7, color: '#333333' }}>→</div>
          </button>
        </div>

        {/* Extra space for navigation bar */}
        <div style={{ height: '120px' }}></div>
      </div>
    </div>
  );
}
