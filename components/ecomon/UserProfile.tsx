'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../../utils/auth';

// UUID-based User Identity
interface UserIdentity {
  userId: string;
  isVerified: boolean;
  credentials: any[];
}

// User Profile - Trainer Profile Style

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'recycling' | 'collection' | 'exploration' | 'social' | 'special';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
  reward: {
    ecoPoints: number;
    ecoTokens: number;
    title?: string;
  };
}

interface UserStats {
  level: number;
  experience: number;
  experienceToNext: number;
  totalEcoPoints: number;
  totalEcoTokens: number;
  totalRecycled: {
    items: number;
    weight: number; // in grams
    co2Saved: number; // in kg
  };
  streaks: {
    current: number;
    longest: number;
  };
  ecoMons: {
    total: number;
    unique: number;
    legendary: number;
  };
  locations: {
    visited: number;
    discovered: number;
  };
  battleStats: {
    wins: number;
    losses: number;
    totalBattles: number;
    winRate: number;
  };
  joinDate: string;
  rank: {
    global: number;
    local: number;
    percentile: number;
  };
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: string;
  level: number;
  ecoPoints: number;
  totalRecycled: number;
  isCurrentUser?: boolean;
}

// Sample achievements
const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_recycle',
    name: 'First Steps',
    description: 'Complete your first recycling action',
    icon: '🌱',
    category: 'recycling',
    rarity: 'bronze',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedDate: '2024-07-19T10:30:00Z',
    reward: { ecoPoints: 100, ecoTokens: 10 }
  },
  {
    id: 'plastic_warrior',
    name: 'Plastic Warrior',
    description: 'Recycle 100 plastic items',
    icon: '🦎',
    category: 'recycling',
    rarity: 'silver',
    progress: 67,
    maxProgress: 100,
    unlocked: false,
    reward: { ecoPoints: 500, ecoTokens: 50, title: 'Plastic Warrior' }
  },
  {
    id: 'ecomon_collector',
    name: 'EcoMon Collector',
    description: 'Capture 10 different EcoMons',
    icon: '🎒',
    category: 'collection',
    rarity: 'gold',
    progress: 5,
    maxProgress: 10,
    unlocked: false,
    reward: { ecoPoints: 1000, ecoTokens: 100 }
  },
  {
    id: 'legendary_hunter',
    name: 'Legendary Hunter',
    description: 'Capture a legendary EcoMon',
    icon: '💎',
    category: 'collection',
    rarity: 'platinum',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedDate: '2024-07-17T09:45:00Z',
    reward: { ecoPoints: 2000, ecoTokens: 200, title: 'Legend Seeker' }
  },
  {
    id: 'explorer',
    name: 'Urban Explorer',
    description: 'Visit 20 different recycling locations',
    icon: '🗺️',
    category: 'exploration',
    rarity: 'silver',
    progress: 8,
    maxProgress: 20,
    unlocked: false,
    reward: { ecoPoints: 750, ecoTokens: 75 }
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day recycling streak',
    icon: '🔥',
    category: 'special',
    rarity: 'gold',
    progress: 12,
    maxProgress: 30,
    unlocked: false,
    reward: { ecoPoints: 1500, ecoTokens: 150, title: 'Eco Warrior' }
  },
  {
    id: 'co2_saver',
    name: 'Climate Hero',
    description: 'Save 100kg of CO2 through recycling',
    icon: '🌍',
    category: 'recycling',
    rarity: 'diamond',
    progress: 45.6,
    maxProgress: 100,
    unlocked: false,
    reward: { ecoPoints: 5000, ecoTokens: 500, title: 'Climate Hero' }
  },
  {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Inspire 50 friends to join EcoMon',
    icon: '👥',
    category: 'social',
    rarity: 'platinum',
    progress: 3,
    maxProgress: 50,
    unlocked: false,
    reward: { ecoPoints: 3000, ecoTokens: 300, title: 'Eco Ambassador' }
  }
];

// Sample user stats
const SAMPLE_USER_STATS: UserStats = {
  level: 18,
  experience: 12450,
  experienceToNext: 2550,
  totalEcoPoints: 8750,
  totalEcoTokens: 875,
  totalRecycled: {
    items: 234,
    weight: 45600, // 45.6kg
    co2Saved: 45.6
  },
  streaks: {
    current: 12,
    longest: 28
  },
  ecoMons: {
    total: 5,
    unique: 5,
    legendary: 1
  },
  locations: {
    visited: 8,
    discovered: 3
  },
  battleStats: {
    wins: 15,
    losses: 8,
    totalBattles: 23,
    winRate: 65.2
  },
  joinDate: '2024-06-15T08:00:00Z',
  rank: {
    global: 1247,
    local: 23,
    percentile: 85
  }
};

// Sample leaderboard
const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'user_001', displayName: 'EcoMaster_KL', avatar: '🏆', level: 45, ecoPoints: 25600, totalRecycled: 1250 },
  { rank: 2, userId: 'user_002', displayName: 'GreenWarrior88', avatar: '🌟', level: 42, ecoPoints: 23400, totalRecycled: 1180 },
  { rank: 3, userId: 'user_003', displayName: 'RecycleQueen', avatar: '👑', level: 40, ecoPoints: 21800, totalRecycled: 1095 },
  { rank: 4, userId: 'user_004', displayName: 'PlasticSlayer', avatar: '⚔️', level: 38, ecoPoints: 19200, totalRecycled: 980 },
  { rank: 5, userId: 'user_005', displayName: 'EcoNinja_MY', avatar: '🥷', level: 36, ecoPoints: 17600, totalRecycled: 890 },
  { rank: 23, userId: 'current_user', displayName: 'EcoWarrior', avatar: '🧑‍🌾', level: 18, ecoPoints: 8750, totalRecycled: 234, isCurrentUser: true }
];

export default function UserProfile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'leaderboard' | 'identity'>('stats');
  const [achievements, setAchievements] = useState<Achievement[]>(SAMPLE_ACHIEVEMENTS);
  const [userStats, setUserStats] = useState<UserStats>(SAMPLE_USER_STATS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(SAMPLE_LEADERBOARD);
  const [achievementFilter, setAchievementFilter] = useState<string>('all');

  // User Identity State
  const [userIdentity, setUserIdentity] = useState<UserIdentity | null>(null);
  const [isCreatingIdentity, setIsCreatingIdentity] = useState(false);
  const [showIdentityInfo, setShowIdentityInfo] = useState(false);

  // Handle URL tab parameter
  useEffect(() => {
    if (router.query.tab && typeof router.query.tab === 'string') {
      const validTabs = ['stats', 'achievements', 'leaderboard', 'identity'];
      if (validTabs.includes(router.query.tab)) {
        setActiveTab(router.query.tab as any);
      }
    }
  }, [router.query.tab]);

  // Auto-create User Identity on first visit
  useEffect(() => {
    const initializeUserIdentity = async () => {
      try {
        // Check if user identity already exists in localStorage
        const existingIdentity = localStorage.getItem('ecomon_user_identity');
        if (existingIdentity) {
          setUserIdentity(JSON.parse(existingIdentity));
          return;
        }

        // Create new user identity for first-time user
        setIsCreatingIdentity(true);
        console.log('🆔 Creating new EcoMon User Identity...');

        // Generate UUID-based user identity
        const newIdentity: UserIdentity = {
          userId: `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          isVerified: true,
          credentials: []
        };

        // Store identity locally
        localStorage.setItem('ecomon_user_identity', JSON.stringify(newIdentity));
        setUserIdentity(newIdentity);

        console.log('✅ EcoMon User Identity created:', newIdentity.userId);

      } catch (error) {
        console.error('❌ Error creating user identity:', error);
      } finally {
        setIsCreatingIdentity(false);
      }
    };

    initializeUserIdentity();
  }, []);

  const getRarityColor = (rarity: string): string => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF'
    };
    return colors[rarity as keyof typeof colors] || '#CD7F32';
  };

  const getCategoryIcon = (category: string): string => {
    const icons = {
      recycling: '♻️',
      collection: '🎒',
      exploration: '🗺️',
      social: '👥',
      special: '⭐'
    };
    return icons[category as keyof typeof icons] || '🏆';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWeight = (grams: number): string => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)}kg`;
    }
    return `${grams}g`;
  };

  const getExperiencePercentage = (): number => {
    const totalNeeded = userStats.experience + userStats.experienceToNext;
    return (userStats.experience / totalNeeded) * 100;
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (achievementFilter === 'all') return true;
    if (achievementFilter === 'unlocked') return achievement.unlocked;
    if (achievementFilter === 'locked') return !achievement.unlocked;
    return achievement.category === achievementFilter;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      paddingBottom: '80px',
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

      {/* Header */}
      <div style={{
        background: 'rgba(33,150,243,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        margin: '20px',
        padding: '24px 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        color: 'white'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '8px' }}>
          🧑‍🌾
        </div>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          {getCurrentUser()?.displayName || 'EcoWarrior'}
        </h1>
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '4px 12px',
          borderRadius: '12px',
          display: 'inline-block',
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>
          Level {userStats.level} • Rank #{userStats.rank.local} (Local)
        </div>

        {/* Experience Bar */}
        <div style={{ marginTop: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            marginBottom: '4px',
            opacity: 0.9
          }}>
            <span>{userStats.experience.toLocaleString()} XP</span>
            <span>{userStats.experienceToNext.toLocaleString()} to Level {userStats.level + 1}</span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'white',
              height: '100%',
              width: `${getExperiencePercentage()}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        margin: '0 20px 20px 20px',
        display: 'flex',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        {[
          { key: 'stats', label: 'Stats', icon: '📊' },
          { key: 'achievements', label: 'Achievements', icon: '🏆' },
          { key: 'leaderboard', label: 'Leaderboard', icon: '🥇' },
          { key: 'identity', label: 'Identity', icon: '🆔' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              flex: 1,
              padding: '16px 8px',
              border: 'none',
              background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              cursor: 'pointer',
              borderRadius: activeTab === tab.key ? '16px' : '0',
              margin: activeTab === tab.key ? '8px' : '0',
              transition: 'all 0.3s ease',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            <div>{tab.icon}</div>
            <div>{tab.label}</div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        padding: '0 20px 16px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div>
            {/* Quick Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#4CAF50',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {userStats.totalEcoPoints.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '600'
                }}>EcoPoints</div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#2196F3',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {userStats.totalEcoTokens.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '600'
                }}>EcoTokens</div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#FF9800',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {userStats.totalRecycled.items}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '600'
                }}>Items Recycled</div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#9C27B0',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {userStats.ecoMons.total}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '600'
                }}>EcoMons</div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                marginBottom: '16px',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>♻️ Recycling Impact</h3>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Total Weight Recycled:</span>
                  <strong style={{ color: 'white' }}>{formatWeight(userStats.totalRecycled.weight)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>CO2 Saved:</span>
                  <strong style={{ color: '#4CAF50' }}>{userStats.totalRecycled.co2Saved}kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Current Streak:</span>
                  <strong style={{ color: '#FF9800' }}>{userStats.streaks.current} days 🔥</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Longest Streak:</span>
                  <strong style={{ color: 'white' }}>{userStats.streaks.longest} days</strong>
                </div>
              </div>
            </div>

            {/* Collection Stats */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                marginBottom: '16px',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>🎒 Collection Progress</h3>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Total EcoMons:</span>
                  <strong style={{ color: 'white' }}>{userStats.ecoMons.total}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Unique Types:</span>
                  <strong style={{ color: 'white' }}>{userStats.ecoMons.unique}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Legendary EcoMons:</span>
                  <strong style={{ color: '#FF9800' }}>{userStats.ecoMons.legendary} 💎</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Collection Completion:</span>
                  <strong style={{ color: 'white' }}>{Math.min((userStats.ecoMons.total / 50) * 100, 100).toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            {/* Exploration Stats */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                marginBottom: '16px',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>🗺️ Exploration</h3>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Locations Visited:</span>
                  <strong style={{ color: 'white' }}>{userStats.locations.visited}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>New Locations Discovered:</span>
                  <strong style={{ color: '#2196F3' }}>{userStats.locations.discovered} 🆕</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Global Rank:</span>
                  <strong style={{ color: 'white' }}>#{userStats.rank.global.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Top Percentile:</span>
                  <strong style={{ color: '#4CAF50' }}>{userStats.rank.percentile}%</strong>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                marginBottom: '16px',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>👤 Account</h3>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Member Since:</span>
                  <strong style={{ color: 'white' }}>{formatDate(userStats.joinDate)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>Days Active:</span>
                  <strong style={{ color: 'white' }}>{Math.floor((Date.now() - new Date(userStats.joinDate).getTime()) / (1000 * 60 * 60 * 24))} days</strong>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: '12px',
                  wordBreak: 'break-all'
                }}>
                  <strong style={{ color: 'rgba(255,255,255,0.9)' }}>UserID:</strong> {getCurrentUser()?.userId || 'user_demo_uuid'}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                marginBottom: '16px',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>⚡ Quick Actions</h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <button
                  onClick={() => window.location.href = '/vouchers'}
                  style={{
                    background: 'linear-gradient(135deg, #E91E63, #AD1457)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(233,30,99,0.3)',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(233,30,99,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(233,30,99,0.3)';
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎁</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Vouchers</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Trade battle wins</div>
                </button>

                <button
                  onClick={() => window.location.href = '/battle'}
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(255,107,53,0.3)',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,107,53,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,107,53,0.3)';
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚔️</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Battle Arena</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Earn more wins</div>
                </button>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#4CAF50',
                  marginBottom: '4px'
                }}>
                  {userStats.battleStats?.wins || 0} Battle Wins Available
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Use your wins to claim exclusive vouchers and rewards!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            {/* Achievement Filters */}
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {[
                  { key: 'all', label: 'All', icon: '🏆' },
                  { key: 'unlocked', label: 'Unlocked', icon: '✅' },
                  { key: 'locked', label: 'Locked', icon: '🔒' },
                  { key: 'recycling', label: 'Recycling', icon: '♻️' },
                  { key: 'collection', label: 'Collection', icon: '🎒' },
                  { key: 'exploration', label: 'Exploration', icon: '🗺️' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setAchievementFilter(filter.key)}
                    style={{
                      background: achievementFilter === filter.key ? '#2196F3' : '#f5f5f5',
                      color: achievementFilter === filter.key ? 'white' : '#333',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {filter.icon} {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Achievement Progress Summary */}
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '4px' }}>
                {achievements.filter(a => a.unlocked).length} / {achievements.length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Achievements Unlocked ({Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%)
              </div>
            </div>

            {/* Achievements List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    border: achievement.unlocked ? `2px solid ${getRarityColor(achievement.rarity)}` : '2px solid #e0e0e0',
                    opacity: achievement.unlocked ? 1 : 0.7,
                    position: 'relative'
                  }}
                >
                  {/* Achievement Header */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{
                      fontSize: '32px',
                      marginRight: '12px',
                      filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
                    }}>
                      {achievement.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                          {achievement.name}
                        </h4>
                        <span style={{
                          background: getRarityColor(achievement.rarity),
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {achievement.rarity.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '12px' }}>
                          {getCategoryIcon(achievement.category)}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        {achievement.description}
                      </p>
                    </div>

                    {achievement.unlocked && (
                      <div style={{
                        background: '#4CAF50',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!achievement.unlocked && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '4px',
                        color: '#666'
                      }}>
                        <span>Progress</span>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <div style={{
                        background: '#e0e0e0',
                        height: '6px',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: getRarityColor(achievement.rarity),
                          height: '100%',
                          width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    <strong>Rewards:</strong> {achievement.reward.ecoPoints} EcoPoints, {achievement.reward.ecoTokens} EcoTokens
                    {achievement.reward.title && (
                      <span style={{ color: '#2196F3', fontWeight: 'bold' }}>
                        , Title: "{achievement.reward.title}"
                      </span>
                    )}
                  </div>

                  {/* Unlock Date */}
                  {achievement.unlocked && achievement.unlockedDate && (
                    <div style={{
                      fontSize: '10px',
                      color: '#999',
                      marginTop: '8px',
                      textAlign: 'right'
                    }}>
                      Unlocked: {formatDate(achievement.unlockedDate)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            {/* Leaderboard Header */}
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>🏆 Malaysia Leaderboard</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Top EcoWarriors in your region
              </p>
            </div>

            {/* Leaderboard List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  style={{
                    background: entry.isCurrentUser ? '#e3f2fd' : 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    border: entry.isCurrentUser ? '2px solid #2196F3' : '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    background: entry.rank <= 3 ? '#FFD700' : '#f5f5f5',
                    color: entry.rank <= 3 ? 'white' : '#333',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </div>

                  {/* Avatar */}
                  <div style={{ fontSize: '24px' }}>
                    {entry.avatar}
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: entry.isCurrentUser ? '#2196F3' : '#333'
                    }}>
                      {entry.displayName}
                      {entry.isCurrentUser && <span style={{ color: '#2196F3' }}> (You)</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Level {entry.level} • {entry.totalRecycled} items recycled
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: '#4CAF50'
                    }}>
                      {entry.ecoPoints.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      EcoPoints
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Your Rank Summary */}
            <div style={{
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              color: 'white',
              padding: '16px',
              borderRadius: '16px',
              marginTop: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                Your Ranking
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                #{userStats.rank.local} in Malaysia • #{userStats.rank.global.toLocaleString()} Globally
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                Top {userStats.rank.percentile}% of all EcoWarriors
              </div>
            </div>
          </div>
        )}

        {/* Identity Tab */}
        {activeTab === 'identity' && (
          <div>
            {/* User Profile Information */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                color: '#FF6B35',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                👤 User Profile
              </h3>

              <div style={{
                background: '#f5f5f5',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '14px',
                color: '#333'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong>🆔 User ID:</strong> {userStats.level > 0 ? `ECO-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : 'Not logged in'}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>📅 Member Since:</strong> {userStats.joinDate}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>🏆 Current Level:</strong> {userStats.level}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>⭐ Experience Points:</strong> {userStats.experience.toLocaleString()}
                </div>
                <div>
                  <strong>🏅 Rank:</strong> #{userStats.rank.global.toLocaleString()} Global
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
