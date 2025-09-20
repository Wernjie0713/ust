'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Social Battle - Find Friends and Battle

interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  level: number;
  distance: number; // in meters
  isOnline: boolean;
  lastSeen: string;
  battleStats: {
    wins: number;
    losses: number;
    winRate: number;
  };
  currentMonster: {
    name: string;
    image: string;
    level: number;
    hp: number;
    maxHp: number;
  };
}

// Sample nearby friends data
const SAMPLE_FRIENDS: Friend[] = [
  {
    id: 'friend_001',
    username: 'eco_warrior_88',
    displayName: 'Alex Chen',
    avatar: '🧑‍🌾',
    level: 23,
    distance: 150,
    isOnline: true,
    lastSeen: '2024-07-20T10:30:00Z',
    battleStats: {
      wins: 45,
      losses: 23,
      winRate: 66.2
    },
    currentMonster: {
      name: 'PlasticEater Alpha',
      image: '/assets/m1.jpeg',
      level: 18,
      hp: 100,
      maxHp: 100
    }
  },
  {
    id: 'friend_002',
    username: 'green_guardian',
    displayName: 'Sarah Kim',
    avatar: '👩‍🔬',
    level: 31,
    distance: 280,
    isOnline: true,
    lastSeen: '2024-07-20T10:25:00Z',
    battleStats: {
      wins: 78,
      losses: 34,
      winRate: 69.6
    },
    currentMonster: {
      name: 'MetalCrusher Beta',
      image: '/assets/m2.jpeg',
      level: 25,
      hp: 100,
      maxHp: 100
    }
  },
  {
    id: 'friend_003',
    username: 'recycle_master',
    displayName: 'Mike Johnson',
    avatar: '🧑‍💼',
    level: 19,
    distance: 420,
    isOnline: false,
    lastSeen: '2024-07-20T09:45:00Z',
    battleStats: {
      wins: 32,
      losses: 28,
      winRate: 53.3
    },
    currentMonster: {
      name: 'GlassBreaker Gamma',
      image: '/assets/geng.jpeg',
      level: 15,
      hp: 100,
      maxHp: 100
    }
  },
  {
    id: 'friend_004',
    username: 'eco_ninja_kl',
    displayName: 'Priya Patel',
    avatar: '👩‍🎓',
    level: 27,
    distance: 650,
    isOnline: true,
    lastSeen: '2024-07-20T10:32:00Z',
    battleStats: {
      wins: 56,
      losses: 19,
      winRate: 74.7
    },
    currentMonster: {
      name: 'PaperShredder Delta',
      image: '/assets/m3.jpeg',
      level: 22,
      hp: 100,
      maxHp: 100
    }
  },
  {
    id: 'friend_005',
    username: 'waste_warrior',
    displayName: 'David Lim',
    avatar: '🧑‍🚀',
    level: 15,
    distance: 890,
    isOnline: false,
    lastSeen: '2024-07-20T08:20:00Z',
    battleStats: {
      wins: 28,
      losses: 35,
      winRate: 44.4
    },
    currentMonster: {
      name: 'ElectroDigester Epsilon',
      image: '/assets/m4.jpeg',
      level: 12,
      hp: 100,
      maxHp: 100
    }
  }
];

export default function SocialBattle() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>(SAMPLE_FRIENDS);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [battleMode, setBattleMode] = useState<'list' | 'battle'>('list');
  const [shakeCount, setShakeCount] = useState(0);
  const [battleProgress, setBattleProgress] = useState(0);
  const [battleResult, setBattleResult] = useState<'none' | 'victory' | 'defeat'>('none');
  const [isShaking, setIsShaking] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showVictoryMessage, setShowVictoryMessage] = useState(false);
  const [showDamage, setShowDamage] = useState<number | null>(null);
  const [battleEffects, setBattleEffects] = useState<string[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    oldLevel: number;
    newLevel: number;
    expGained: number;
  } | null>(null);

  // Device motion detection for shake + tap functionality
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    const shakeThreshold = 15;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!battleMode || battleMode !== 'battle') return;

      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x = 0, y = 0, z = 0 } = acceleration;
      const currentX = x ?? 0;
      const currentY = y ?? 0;
      const currentZ = z ?? 0;

      const deltaX = Math.abs(currentX - lastX);
      const deltaY = Math.abs(currentY - lastY);
      const deltaZ = Math.abs(currentZ - lastZ);

      if (deltaX + deltaY + deltaZ > shakeThreshold) {
        handleAttack('shake');
      }

      lastX = currentX;
      lastY = currentY;
      lastZ = currentZ;
    };

    if (typeof window !== 'undefined' && battleMode === 'battle') {
      window.addEventListener('devicemotion', handleDeviceMotion);

      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      };
    }
  }, [battleMode]);

  // Handle attack (shake or tap)
  const handleAttack = (type: 'shake' | 'tap') => {
    if (battleResult !== 'none') return;

    setIsShaking(true);

    // Calculate damage with combo system
    const baseDamage = type === 'tap' ? 2 : 3; // Taps do slightly less damage
    const damage = baseDamage * comboMultiplier;

    // Update counts
    if (type === 'shake') {
      setShakeCount(prev => prev + 1);
    } else {
      setTapCount(prev => prev + 1);
    }

    // Show damage number
    setShowDamage(damage);
    setTimeout(() => setShowDamage(null), 800);

    // Add battle effect
    const effects = ['💥', '⚡', '🔥', '💢', '✨'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    setBattleEffects(prev => [...prev, randomEffect]);
    setTimeout(() => {
      setBattleEffects(prev => prev.slice(1));
    }, 1000);

    // Increase combo multiplier
    setComboMultiplier(prev => Math.min(prev + 0.1, 3));

    // Reset combo after 2 seconds of inactivity
    setTimeout(() => {
      setComboMultiplier(1);
    }, 2000);

    setTimeout(() => setIsShaking(false), 200);
  };

  // Handle screen tap
  const handleScreenTap = () => {
    if (battleMode === 'battle') {
      handleAttack('tap');
    }
  };

  // Battle progress based on total attacks (shake + tap)
  useEffect(() => {
    const totalAttacks = shakeCount + tapCount;
    if (totalAttacks > 0) {
      const progress = Math.min((totalAttacks / 20) * 100, 100); // 20 total attacks = 100%
      setBattleProgress(progress);

      if (progress >= 100 && battleResult === 'none') {
        setBattleResult('victory');

        // Calculate level up (simulate gaining experience)
        const expGained = 150;
        const currentLevel = 12; // Mock current level
        const expNeededForNextLevel = 200;
        const shouldLevelUp = Math.random() > 0.5; // 50% chance to level up for demo

        if (shouldLevelUp) {
          setLevelUpData({
            oldLevel: currentLevel,
            newLevel: currentLevel + 1,
            expGained: expGained
          });
        }

        // Show victory message after 3 seconds of video (video auto-closes, dialog stays)
        setTimeout(() => {
          setShowVictoryMessage(true);
        }, 3000);

        // Show level up notification bar after victory (if applicable)
        if (shouldLevelUp) {
          setTimeout(() => {
            setShowLevelUp(true);
            // Play level up sound effect (if available)
            try {
              const audio = new Audio('/assets/levelup.mp3');
              audio.volume = 0.3;
              audio.play().catch(() => {
                // Ignore audio play errors (user interaction required)
              });
            } catch (error) {
              // Ignore audio errors
            }
          }, 2000); // Show during victory video for better visibility
        }

        // No automatic return - user will close manually
      }
    }
  }, [shakeCount, tapCount, battleResult]);

  // Manual close function for victory
  const closeBattle = () => {
    setBattleMode('list');
    setShakeCount(0);
    setTapCount(0);
    setBattleProgress(0);
    setBattleResult('none');
    setShowVictoryMessage(false);
    setShowLevelUp(false);
    setLevelUpData(null);
    setSelectedFriend(null);
    setComboMultiplier(1);
    setBattleEffects([]);
  };

  const startBattle = (friend: Friend) => {
    setSelectedFriend(friend);
    setBattleMode('battle');
    setShakeCount(0);
    setBattleProgress(0);
    setBattleResult('none');
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${distance}m away`;
    } else {
      return `${(distance / 1000).toFixed(1)}km away`;
    }
  };

  const formatLastSeen = (lastSeen: string): string => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (battleMode === 'battle' && selectedFriend) {
    return (
      <div
        style={{
          minHeight: '100vh',
          paddingBottom: '0px',
          position: 'relative',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px 20px 20px', // Remove top padding, keep others
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={handleScreenTap}
        onTouchStart={(e) => {
          e.preventDefault();
          handleScreenTap();
        }}
      >
        {/* Battle Arena Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 30% 30%, rgba(255,107,53,0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(76,175,80,0.3) 0%, transparent 50%),
            linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)
          `,
          pointerEvents: 'none'
        }} />

        {/* Battle Header */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center',
          zIndex: 1
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '24px',
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            ⚔️ Battle Arena
          </h1>
          <p style={{
            margin: 0,
            color: 'rgba(255,255,255,0.9)',
            fontSize: '16px',
            textAlign: 'center'
          }}>
            Shake OR Tap to defeat {selectedFriend.displayName}'s monster!
          </p>
          <div style={{
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              📱 <span>Shake</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>or</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              👆 <span>Tap Screen</span>
            </div>
          </div>
          {comboMultiplier > 1 && (
            <div style={{
              marginTop: '8px',
              background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '15px',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>
              🔥 COMBO x{comboMultiplier.toFixed(1)}
            </div>
          )}
        </div>

        {/* Enemy Monster */}
        <div style={{
          position: 'relative',
          marginBottom: '30px',
          zIndex: 1
        }}>
          {/* Battle Effects */}
          {battleEffects.map((effect, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                fontSize: '32px',
                zIndex: 10,
                animation: 'battleEffect 1s ease-out forwards',
                pointerEvents: 'none'
              }}
            >
              {effect}
            </div>
          ))}

          {/* Damage Number */}
          {showDamage && (
            <div style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FF4444',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              zIndex: 10,
              animation: 'damageNumber 0.8s ease-out forwards',
              pointerEvents: 'none'
            }}>
              -{showDamage}
            </div>
          )}

          <div style={{
            background: battleProgress > 75
              ? 'rgba(255,0,0,0.2)'
              : 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: battleProgress > 75
              ? '2px solid rgba(255,0,0,0.8)'
              : '2px solid rgba(255,107,53,0.5)',
            borderRadius: '20px',
            padding: '20px',
            textAlign: 'center',
            transform: isShaking
              ? `scale(0.95) rotate(${Math.random() * 10 - 5}deg)`
              : 'scale(1)',
            transition: 'all 0.2s ease',
            boxShadow: isShaking
              ? '0 0 30px rgba(255,107,53,0.6)'
              : '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              fontSize: '16px',
              color: 'white',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              {selectedFriend.displayName}'s Monster
            </div>

            <div style={{
              position: 'relative',
              display: 'inline-block'
            }}>
              <img
                src={selectedFriend.currentMonster.image}
                alt={selectedFriend.currentMonster.name}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: battleProgress > 75
                    ? '3px solid rgba(255,0,0,0.8)'
                    : '3px solid rgba(255,107,53,0.6)',
                  filter: battleProgress > 50
                    ? `grayscale(${battleProgress}%) brightness(${1 - battleProgress/200})`
                    : 'none',
                  transform: isShaking
                    ? `rotate(${Math.random() * 20 - 10}deg) scale(0.95)`
                    : 'rotate(0deg) scale(1)',
                  transition: 'all 0.2s ease'
                }}
              />

              {/* Critical Hit Effect */}
              {battleProgress > 75 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '48px',
                  animation: 'pulse 0.5s infinite',
                  pointerEvents: 'none'
                }}>
                  💀
                </div>
              )}
            </div>

            <div style={{
              fontSize: '14px',
              color: 'white',
              marginTop: '10px',
              fontWeight: 'bold'
            }}>
              {selectedFriend.currentMonster.name}
            </div>

            {/* Enhanced HP Bar */}
            <div style={{
              marginTop: '10px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '10px',
              height: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{
                background: battleProgress < 30
                  ? 'linear-gradient(90deg, #4CAF50, #66BB6A)'
                  : battleProgress < 70
                    ? 'linear-gradient(90deg, #FF9800, #FFB74D)'
                    : 'linear-gradient(90deg, #F44336, #EF5350)',
                height: '100%',
                width: `${100 - battleProgress}%`,
                transition: 'all 0.3s ease',
                boxShadow: battleProgress > 75
                  ? '0 0 10px rgba(255,0,0,0.8)'
                  : 'none'
              }} />
            </div>

            <div style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.8)',
              marginTop: '5px',
              fontWeight: 'bold'
            }}>
              HP: {Math.max(0, Math.round(100 - battleProgress))}/100
              {battleProgress > 75 && (
                <span style={{ color: '#FF4444', marginLeft: '10px' }}>
                  💀 CRITICAL!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Battle Progress */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '20px',
          width: '100%',
          maxWidth: '300px',
          textAlign: 'center',
          marginBottom: '30px',
          zIndex: 1
        }}>
          <div style={{
            fontSize: '18px',
            color: 'white',
            marginBottom: '15px',
            fontWeight: 'bold'
          }}>
            Battle Progress: {Math.round(battleProgress)}%
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '15px',
            height: '12px',
            overflow: 'hidden',
            marginBottom: '15px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #4CAF50, #2E7D32)',
              height: '100%',
              width: `${battleProgress}%`,
              transition: 'all 0.3s ease'
            }} />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '10px'
          }}>
            <div>📱 Shakes: {shakeCount}</div>
            <div>👆 Taps: {tapCount}</div>
            <div>🎯 Total: {shakeCount + tapCount}/20</div>
          </div>

          {battleProgress < 100 && (
            <div style={{
              fontSize: '16px',
              color: '#4CAF50',
              fontWeight: 'bold',
              animation: 'pulse 1s infinite',
              textAlign: 'center'
            }}>
              {Math.random() > 0.5 ? '📱 Shake phone!' : '👆 Tap screen!'}
            </div>
          )}

          {comboMultiplier > 1.5 && (
            <div style={{
              fontSize: '14px',
              color: '#FF6B35',
              fontWeight: 'bold',
              marginTop: '8px',
              textAlign: 'center',
              animation: 'pulse 0.5s infinite'
            }}>
              🔥 ON FIRE! Keep attacking!
            </div>
          )}
        </div>

        {/* Our Monster Icon - Bottom Left */}
        <div style={{
          position: 'fixed',
          bottom: '100px', // Above navigation bar
          left: '20px',
          zIndex: 1000
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '3px solid #4CAF50',
            boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
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

        {/* Battle Result */}
        {battleResult === 'victory' && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            flexDirection: 'column'
          }}>
            {/* Victory Video - Full Screen */}
            <video
              autoPlay
              muted
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                zIndex: -1,
                opacity: showVictoryMessage ? 0 : 1,
                transition: 'opacity 1s ease-in-out'
              }}
            >
              <source src="/assets/winning.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Black Fade Overlay */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'black',
              zIndex: -1,
              opacity: showVictoryMessage ? 1 : 0,
              transition: 'opacity 1s ease-in-out'
            }} />

            {/* Victory Message */}
            {showVictoryMessage && (
              <div style={{
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(76,175,80,1)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                animation: 'bounceIn 0.5s ease',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                position: 'relative'
              }}>
                {/* Close Button */}
                <button
                  onClick={closeBattle}
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
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ✕
                </button>

                <div style={{
                  fontSize: '48px',
                  marginBottom: '15px'
                }}>
                  🎉
                </div>
                <div style={{
                  fontSize: '24px',
                  color: 'white',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  VICTORY!
                </div>
                <div style={{
                  fontSize: '16px',
                  color: 'white',
                  marginBottom: '15px'
                }}>
                  You defeated {selectedFriend.displayName}'s monster!
                </div>
                <div style={{
                  fontSize: '18px',
                  color: '#FFD700',
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}>
                  +150 EcoPoints • +15 EcoTokens
                </div>

                {/* Continue Button */}
                <button
                  onClick={closeBattle}
                  style={{
                    background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(76,175,80,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(76,175,80,0.3)';
                  }}
                >
                  🎮 Continue
                </button>
              </div>
            )}

            {/* Level Up Notification Bar */}
            {showLevelUp && levelUpData && (
              <div style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                right: '20px',
                background: 'linear-gradient(135deg, rgba(255,215,0,0.95) 0%, rgba(255,165,0,0.95) 100%)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255,215,0,1)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: 'slideInFromTop 0.5s ease',
                boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
                zIndex: 1000
              }}>
                {/* Left Content */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {/* Level Up Icon */}
                  <div style={{
                    fontSize: '24px',
                    animation: 'levelUpPulse 1.5s ease-in-out infinite'
                  }}>
                    ⭐
                  </div>

                  {/* Level Up Text */}
                  <div>
                    <div style={{
                      fontSize: '16px',
                      color: '#1a1a1a',
                      fontWeight: 'bold',
                      marginBottom: '2px'
                    }}>
                      Level Up! Level {levelUpData.newLevel}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#1a1a1a',
                      opacity: 0.8
                    }}>
                      +{levelUpData.expGained} EXP gained
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowLevelUp(false)}
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    color: '#1a1a1a',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    fontWeight: 'bold'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }
          @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slideInFromTop {
            0% {
              transform: translateY(-100px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes levelUpPulse {
            0%, 100% {
              transform: scale(1);
              filter: drop-shadow(0 0 20px rgba(255,215,0,0.8));
            }
            50% {
              transform: scale(1.2);
              filter: drop-shadow(0 0 30px rgba(255,215,0,1));
            }
          }
          @keyframes battleEffect {
            0% {
              transform: scale(0.5) translateY(0px);
              opacity: 1;
            }
            50% {
              transform: scale(1.2) translateY(-20px);
              opacity: 0.8;
            }
            100% {
              transform: scale(0.8) translateY(-40px);
              opacity: 0;
            }
          }
          @keyframes damageNumber {
            0% {
              transform: scale(0.8) translateY(0px);
              opacity: 1;
            }
            50% {
              transform: scale(1.2) translateY(-10px);
              opacity: 1;
            }
            100% {
              transform: scale(1) translateY(-30px);
              opacity: 0;
            }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px) rotate(-1deg); }
            75% { transform: translateX(5px) rotate(1deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '0px',
      position: 'relative',
      background: 'transparent'
    }}>
      {/* Level Up Notification Bar - Also show in main view */}
      {showLevelUp && levelUpData && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.95) 0%, rgba(255,165,0,0.95) 100%)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,215,0,1)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'slideInFromTop 0.5s ease',
          boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
          zIndex: 1000
        }}>
          {/* Left Content */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Level Up Icon */}
            <div style={{
              fontSize: '24px',
              animation: 'levelUpPulse 1.5s ease-in-out infinite'
            }}>
              ⭐
            </div>

            {/* Level Up Text */}
            <div>
              <div style={{
                fontSize: '16px',
                color: '#1a1a1a',
                fontWeight: 'bold',
                marginBottom: '2px'
              }}>
                Level Up! Level {levelUpData.newLevel}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#1a1a1a',
                opacity: 0.8
              }}>
                +{levelUpData.expGained} EXP gained
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowLevelUp(false)}
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: '#1a1a1a',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>
      )}

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

      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        margin: '0 20px 20px 20px', // Remove top margin, keep others
        padding: '20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            👥
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Social Battle
          </h1>
        </div>
        <p style={{
          margin: 0,
          color: 'rgba(255,255,255,0.9)',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Challenge nearby friends to epic monster battles!
        </p>
      </div>

      {/* Friends List */}
      <div style={{
        margin: '0 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: '0 0 15px 0',
            fontSize: '20px',
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🌍 Nearby Friends
          </h2>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            {friends.filter(f => f.isOnline).length} friends online • {friends.length} total nearby
          </p>
        </div>

        {/* Friends Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {friends.map((friend) => (
            <div
              key={friend.id}
              style={{
                background: friend.isOnline
                  ? 'rgba(76,175,80,0.15)'
                  : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: friend.isOnline
                  ? '2px solid rgba(76,175,80,0.5)'
                  : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '20px',
                cursor: friend.isOnline ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                opacity: friend.isOnline ? 1 : 0.6
              }}
              onClick={() => friend.isOnline && startBattle(friend)}
              onMouseEnter={(e) => {
                if (friend.isOnline) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(76,175,80,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (friend.isOnline) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px'
              }}>
                {/* Friend Avatar */}
                <div style={{
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '48px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: friend.isOnline ? '3px solid #4CAF50' : '2px solid rgba(255,255,255,0.3)'
                  }}>
                    {friend.avatar}
                  </div>

                  {/* Online Status */}
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: friend.isOnline ? '#4CAF50' : '#757575',
                    border: '2px solid white'
                  }} />
                </div>

                {/* Friend Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '4px'
                  }}>
                    {friend.displayName}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '4px'
                  }}>
                    @{friend.username} • Level {friend.level}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.7)'
                  }}>
                    {formatDistance(friend.distance)} • {friend.isOnline ? 'Online' : formatLastSeen(friend.lastSeen)}
                  </div>
                </div>

                {/* Battle Stats */}
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#4CAF50',
                    marginBottom: '4px'
                  }}>
                    {friend.battleStats.winRate.toFixed(1)}%
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.8)'
                  }}>
                    {friend.battleStats.wins}W / {friend.battleStats.losses}L
                  </div>
                </div>
              </div>

              {/* Monster Preview */}
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <img
                  src={friend.currentMonster.image}
                  alt={friend.currentMonster.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '4px'
                  }}>
                    {friend.currentMonster.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.8)'
                  }}>
                    Level {friend.currentMonster.level} • HP {friend.currentMonster.hp}/{friend.currentMonster.maxHp}
                  </div>
                </div>

                {friend.isOnline && (
                  <div style={{
                    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ⚔️ BATTLE
                  </div>
                )}

                {!friend.isOnline && (
                  <div style={{
                    background: 'rgba(117,117,117,0.8)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    💤 OFFLINE
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
