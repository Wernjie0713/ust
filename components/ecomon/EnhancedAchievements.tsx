'use client'

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../utils/auth';

// Enhanced Achievements System - Comprehensive Badge & Milestone System

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'recycling' | 'collection' | 'exploration' | 'social' | 'special' | 'daily' | 'weekly' | 'seasonal';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  type: 'milestone' | 'challenge' | 'streak' | 'collection' | 'discovery' | 'social';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
  expiryDate?: string; // For time-limited challenges
  reward: {
    ecoPoints: number;
    ecoTokens: number;
    title?: string;
    badge?: string;
    specialReward?: string;
  };
  prerequisites?: string[]; // Achievement IDs that must be completed first
  hidden?: boolean; // Secret achievements
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary';
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';
  unlockedDate: string;
  achievementId: string;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'seasonal';
  progress: number;
  maxProgress: number;
  timeLeft: number; // in hours
  reward: {
    ecoPoints: number;
    ecoTokens: number;
  };
  completed: boolean;
}

// Comprehensive Achievement Database
const ENHANCED_ACHIEVEMENTS: Achievement[] = [
  // === RECYCLING MILESTONES ===
  {
    id: 'first_recycle',
    name: 'First Steps',
    description: 'Complete your first recycling action',
    icon: '🌱',
    category: 'recycling',
    rarity: 'bronze',
    type: 'milestone',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedDate: '2024-07-19T10:30:00Z',
    reward: { ecoPoints: 100, ecoTokens: 10, badge: 'eco_starter' },
    difficulty: 'easy'
  },
  {
    id: 'recycling_novice',
    name: 'Recycling Novice',
    description: 'Recycle 10 items',
    icon: '♻️',
    category: 'recycling',
    rarity: 'bronze',
    type: 'milestone',
    progress: 10,
    maxProgress: 10,
    unlocked: true,
    unlockedDate: '2024-07-19T14:20:00Z',
    reward: { ecoPoints: 250, ecoTokens: 25, badge: 'recycling_novice' },
    difficulty: 'easy'
  },
  {
    id: 'recycling_apprentice',
    name: 'Recycling Apprentice',
    description: 'Recycle 50 items',
    icon: '🔄',
    category: 'recycling',
    rarity: 'silver',
    type: 'milestone',
    progress: 50,
    maxProgress: 50,
    unlocked: true,
    unlockedDate: '2024-07-18T09:15:00Z',
    reward: { ecoPoints: 500, ecoTokens: 50, badge: 'recycling_apprentice' },
    difficulty: 'medium'
  },
  {
    id: 'plastic_warrior',
    name: 'Plastic Warrior',
    description: 'Recycle 100 plastic items',
    icon: '🦎',
    category: 'recycling',
    rarity: 'gold',
    type: 'milestone',
    progress: 67,
    maxProgress: 100,
    unlocked: false,
    reward: { ecoPoints: 1000, ecoTokens: 100, title: 'Plastic Warrior', badge: 'plastic_master' },
    difficulty: 'hard'
  },
  {
    id: 'metal_crusher',
    name: 'Metal Crusher',
    description: 'Recycle 50 metal items',
    icon: '🦾',
    category: 'recycling',
    rarity: 'gold',
    type: 'milestone',
    progress: 23,
    maxProgress: 50,
    unlocked: false,
    reward: { ecoPoints: 1200, ecoTokens: 120, title: 'Metal Crusher', badge: 'metal_master' },
    difficulty: 'hard'
  },
  {
    id: 'glass_breaker',
    name: 'Glass Breaker',
    description: 'Recycle 30 glass items',
    icon: '💎',
    category: 'recycling',
    rarity: 'platinum',
    type: 'milestone',
    progress: 8,
    maxProgress: 30,
    unlocked: false,
    reward: { ecoPoints: 1500, ecoTokens: 150, title: 'Glass Breaker', badge: 'glass_master' },
    difficulty: 'hard'
  },
  {
    id: 'recycling_master',
    name: 'Recycling Master',
    description: 'Recycle 500 items total',
    icon: '👑',
    category: 'recycling',
    rarity: 'diamond',
    type: 'milestone',
    progress: 234,
    maxProgress: 500,
    unlocked: false,
    reward: { ecoPoints: 5000, ecoTokens: 500, title: 'Recycling Master', badge: 'recycling_legend' },
    difficulty: 'extreme'
  },

  // === COLLECTION ACHIEVEMENTS ===
  {
    id: 'first_ecomon',
    name: 'First Companion',
    description: 'Capture your first EcoMon',
    icon: '🥚',
    category: 'collection',
    rarity: 'bronze',
    type: 'milestone',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedDate: '2024-07-19T10:45:00Z',
    reward: { ecoPoints: 200, ecoTokens: 20, badge: 'first_companion' },
    difficulty: 'easy'
  },
  {
    id: 'ecomon_collector',
    name: 'EcoMon Collector',
    description: 'Capture 10 different EcoMons',
    icon: '🎒',
    category: 'collection',
    rarity: 'gold',
    type: 'collection',
    progress: 5,
    maxProgress: 10,
    unlocked: false,
    reward: { ecoPoints: 1000, ecoTokens: 100, badge: 'collector' },
    difficulty: 'medium'
  },
  {
    id: 'legendary_hunter',
    name: 'Legendary Hunter',
    description: 'Capture a legendary EcoMon',
    icon: '🏆',
    category: 'collection',
    rarity: 'platinum',
    type: 'discovery',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedDate: '2024-07-17T09:45:00Z',
    reward: { ecoPoints: 2000, ecoTokens: 200, title: 'Legend Seeker', badge: 'legendary_hunter' },
    difficulty: 'extreme'
  },
  {
    id: 'type_specialist_plastic',
    name: 'Plastic Specialist',
    description: 'Capture 5 different plastic-type EcoMons',
    icon: '🦎',
    category: 'collection',
    rarity: 'silver',
    type: 'collection',
    progress: 2,
    maxProgress: 5,
    unlocked: false,
    reward: { ecoPoints: 750, ecoTokens: 75, badge: 'plastic_specialist' },
    difficulty: 'medium'
  },
  {
    id: 'rainbow_collector',
    name: 'Rainbow Collector',
    description: 'Capture EcoMons of all 7 waste types',
    icon: '🌈',
    category: 'collection',
    rarity: 'diamond',
    type: 'collection',
    progress: 5,
    maxProgress: 7,
    unlocked: false,
    reward: { ecoPoints: 3000, ecoTokens: 300, title: 'Rainbow Master', badge: 'rainbow_collector' },
    difficulty: 'extreme'
  },

  // === EXPLORATION ACHIEVEMENTS ===
  {
    id: 'first_location',
    name: 'Explorer',
    description: 'Visit your first recycling location',
    icon: '🗺️',
    category: 'exploration',
    rarity: 'bronze',
    type: 'discovery',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedDate: '2024-07-19T10:30:00Z',
    reward: { ecoPoints: 150, ecoTokens: 15, badge: 'explorer' },
    difficulty: 'easy'
  },
  {
    id: 'urban_explorer',
    name: 'Urban Explorer',
    description: 'Visit 20 different recycling locations',
    icon: '🏙️',
    category: 'exploration',
    rarity: 'silver',
    type: 'discovery',
    progress: 8,
    maxProgress: 20,
    unlocked: false,
    reward: { ecoPoints: 750, ecoTokens: 75, badge: 'urban_explorer' },
    difficulty: 'medium'
  },
  {
    id: 'district_champion',
    name: 'District Champion',
    description: 'Visit all recycling locations in Kuala Lumpur',
    icon: '🏛️',
    category: 'exploration',
    rarity: 'gold',
    type: 'discovery',
    progress: 8,
    maxProgress: 25,
    unlocked: false,
    reward: { ecoPoints: 1500, ecoTokens: 150, title: 'KL Champion', badge: 'district_champion' },
    difficulty: 'hard'
  },
  {
    id: 'malaysia_explorer',
    name: 'Malaysia Explorer',
    description: 'Visit recycling locations in 5 different states',
    icon: '🇲🇾',
    category: 'exploration',
    rarity: 'platinum',
    type: 'discovery',
    progress: 1,
    maxProgress: 5,
    unlocked: false,
    reward: { ecoPoints: 2500, ecoTokens: 250, title: 'Malaysia Explorer', badge: 'malaysia_explorer' },
    difficulty: 'extreme'
  },

  // === STREAK ACHIEVEMENTS ===
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Maintain a 7-day recycling streak',
    icon: '🔥',
    category: 'special',
    rarity: 'bronze',
    type: 'streak',
    progress: 7,
    maxProgress: 7,
    unlocked: true,
    unlockedDate: '2024-07-16T08:00:00Z',
    reward: { ecoPoints: 300, ecoTokens: 30, badge: 'streak_starter' },
    difficulty: 'easy'
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day recycling streak',
    icon: '🔥',
    category: 'special',
    rarity: 'gold',
    type: 'streak',
    progress: 12,
    maxProgress: 30,
    unlocked: false,
    reward: { ecoPoints: 1500, ecoTokens: 150, title: 'Eco Warrior', badge: 'streak_master' },
    difficulty: 'hard'
  },
  {
    id: 'streak_legend',
    name: 'Streak Legend',
    description: 'Maintain a 100-day recycling streak',
    icon: '🔥',
    category: 'special',
    rarity: 'legendary',
    type: 'streak',
    progress: 12,
    maxProgress: 100,
    unlocked: false,
    reward: { ecoPoints: 10000, ecoTokens: 1000, title: 'Eco Legend', badge: 'streak_legend', specialReward: 'Golden EcoMon Egg' },
    difficulty: 'legendary'
  },

  // === SOCIAL ACHIEVEMENTS ===
  {
    id: 'community_member',
    name: 'Community Member',
    description: 'Join the EcoMon community',
    icon: '👥',
    category: 'social',
    rarity: 'bronze',
    type: 'social',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedDate: '2024-06-15T08:00:00Z',
    reward: { ecoPoints: 100, ecoTokens: 10, badge: 'community_member' },
    difficulty: 'easy'
  },
  {
    id: 'friend_maker',
    name: 'Friend Maker',
    description: 'Add 10 friends to your network',
    icon: '🤝',
    category: 'social',
    rarity: 'silver',
    type: 'social',
    progress: 3,
    maxProgress: 10,
    unlocked: false,
    reward: { ecoPoints: 500, ecoTokens: 50, badge: 'friend_maker' },
    difficulty: 'medium'
  },
  {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Inspire 50 friends to join EcoMon',
    icon: '👑',
    category: 'social',
    rarity: 'platinum',
    type: 'social',
    progress: 3,
    maxProgress: 50,
    unlocked: false,
    reward: { ecoPoints: 3000, ecoTokens: 300, title: 'Eco Ambassador', badge: 'community_leader' },
    difficulty: 'extreme'
  },

  // === ENVIRONMENTAL IMPACT ===
  {
    id: 'co2_saver_bronze',
    name: 'Carbon Reducer',
    description: 'Save 10kg of CO2 through recycling',
    icon: '🌍',
    category: 'special',
    rarity: 'bronze',
    type: 'milestone',
    progress: 10,
    maxProgress: 10,
    unlocked: true,
    unlockedDate: '2024-07-18T16:30:00Z',
    reward: { ecoPoints: 500, ecoTokens: 50, badge: 'carbon_reducer' },
    difficulty: 'easy'
  },
  {
    id: 'co2_saver_silver',
    name: 'Climate Protector',
    description: 'Save 50kg of CO2 through recycling',
    icon: '🌍',
    category: 'special',
    rarity: 'silver',
    type: 'milestone',
    progress: 45.6,
    maxProgress: 50,
    unlocked: false,
    reward: { ecoPoints: 1000, ecoTokens: 100, title: 'Climate Protector', badge: 'climate_protector' },
    difficulty: 'medium'
  },
  {
    id: 'co2_saver_gold',
    name: 'Climate Hero',
    description: 'Save 100kg of CO2 through recycling',
    icon: '🌍',
    category: 'special',
    rarity: 'diamond',
    type: 'milestone',
    progress: 45.6,
    maxProgress: 100,
    unlocked: false,
    reward: { ecoPoints: 5000, ecoTokens: 500, title: 'Climate Hero', badge: 'climate_hero' },
    difficulty: 'extreme'
  },

  // === HIDDEN/SECRET ACHIEVEMENTS ===
  {
    id: 'midnight_recycler',
    name: 'Midnight Recycler',
    description: 'Recycle an item between 12:00 AM - 6:00 AM',
    icon: '🌙',
    category: 'special',
    rarity: 'silver',
    type: 'discovery',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    hidden: true,
    reward: { ecoPoints: 500, ecoTokens: 50, title: 'Night Owl', badge: 'midnight_recycler' },
    difficulty: 'medium'
  },
  {
    id: 'birthday_recycler',
    name: 'Birthday Recycler',
    description: 'Recycle on your birthday',
    icon: '🎂',
    category: 'special',
    rarity: 'gold',
    type: 'discovery',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    hidden: true,
    reward: { ecoPoints: 1000, ecoTokens: 100, title: 'Birthday Warrior', badge: 'birthday_recycler', specialReward: 'Birthday EcoMon' },
    difficulty: 'medium'
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Recycle every day for a week with 100% accuracy',
    icon: '⭐',
    category: 'special',
    rarity: 'platinum',
    type: 'streak',
    progress: 0,
    maxProgress: 7,
    unlocked: false,
    hidden: true,
    reward: { ecoPoints: 2000, ecoTokens: 200, title: 'Perfectionist', badge: 'perfect_week' },
    difficulty: 'extreme'
  }
];

// Daily/Weekly Challenges
const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: 'daily_plastic_1',
    name: 'Plastic Focus',
    description: 'Recycle 5 plastic items today',
    icon: '🦎',
    type: 'daily',
    progress: 2,
    maxProgress: 5,
    timeLeft: 18, // 18 hours left
    reward: { ecoPoints: 200, ecoTokens: 20 },
    completed: false
  },
  {
    id: 'daily_streak_1',
    name: 'Keep the Streak',
    description: 'Maintain your recycling streak today',
    icon: '🔥',
    type: 'daily',
    progress: 0,
    maxProgress: 1,
    timeLeft: 18,
    reward: { ecoPoints: 150, ecoTokens: 15 },
    completed: false
  },
  {
    id: 'weekly_explorer_1',
    name: 'Location Hunter',
    description: 'Visit 3 new recycling locations this week',
    icon: '🗺️',
    type: 'weekly',
    progress: 1,
    maxProgress: 3,
    timeLeft: 120, // 5 days left
    reward: { ecoPoints: 500, ecoTokens: 50 },
    completed: false
  },
  {
    id: 'weekly_variety_1',
    name: 'Variety Pack',
    description: 'Recycle 3 different waste types this week',
    icon: '🌈',
    type: 'weekly',
    progress: 2,
    maxProgress: 3,
    timeLeft: 120,
    reward: { ecoPoints: 400, ecoTokens: 40 },
    completed: false
  }
];

// Badge Collection
const SAMPLE_BADGES: Badge[] = [
  {
    id: 'eco_starter',
    name: 'Eco Starter',
    icon: '🌱',
    description: 'Completed first recycling action',
    rarity: 'bronze',
    unlockedDate: '2024-07-19T10:30:00Z',
    achievementId: 'first_recycle'
  },
  {
    id: 'recycling_novice',
    name: 'Recycling Novice',
    icon: '♻️',
    description: 'Recycled 10 items',
    rarity: 'bronze',
    unlockedDate: '2024-07-19T14:20:00Z',
    achievementId: 'recycling_novice'
  },
  {
    id: 'recycling_apprentice',
    name: 'Recycling Apprentice',
    icon: '🔄',
    description: 'Recycled 50 items',
    rarity: 'silver',
    unlockedDate: '2024-07-18T09:15:00Z',
    achievementId: 'recycling_apprentice'
  },
  {
    id: 'first_companion',
    name: 'First Companion',
    icon: '🥚',
    description: 'Captured first EcoMon',
    rarity: 'bronze',
    unlockedDate: '2024-07-19T10:45:00Z',
    achievementId: 'first_ecomon'
  },
  {
    id: 'legendary_hunter',
    name: 'Legendary Hunter',
    icon: '🏆',
    description: 'Captured a legendary EcoMon',
    rarity: 'platinum',
    unlockedDate: '2024-07-17T09:45:00Z',
    achievementId: 'legendary_hunter'
  },
  {
    id: 'explorer',
    name: 'Explorer',
    icon: '🗺️',
    description: 'Visited first recycling location',
    rarity: 'bronze',
    unlockedDate: '2024-07-19T10:30:00Z',
    achievementId: 'first_location'
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    icon: '🔥',
    description: 'Maintained 7-day streak',
    rarity: 'bronze',
    unlockedDate: '2024-07-16T08:00:00Z',
    achievementId: 'streak_starter'
  },
  {
    id: 'community_member',
    name: 'Community Member',
    icon: '👥',
    description: 'Joined EcoMon community',
    rarity: 'bronze',
    unlockedDate: '2024-06-15T08:00:00Z',
    achievementId: 'community_member'
  },
  {
    id: 'carbon_reducer',
    name: 'Carbon Reducer',
    icon: '🌍',
    description: 'Saved 10kg of CO2',
    rarity: 'bronze',
    unlockedDate: '2024-07-18T16:30:00Z',
    achievementId: 'co2_saver_bronze'
  }
];

export default function EnhancedAchievements() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'achievements' | 'challenges' | 'badges' | 'analytics'>('achievements');
  const [achievements, setAchievements] = useState<Achievement[]>(ENHANCED_ACHIEVEMENTS);
  const [challenges, setChallenges] = useState<Challenge[]>(SAMPLE_CHALLENGES);
  const [badges, setBadges] = useState<Badge[]>(SAMPLE_BADGES);
  const [achievementFilter, setAchievementFilter] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<Achievement | null>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const getRarityColor = (rarity: string): string => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
      legendary: '#FF6B35'
    };
    return colors[rarity as keyof typeof colors] || '#CD7F32';
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors = {
      easy: '#4CAF50',
      medium: '#FF9800',
      hard: '#F44336',
      extreme: '#9C27B0',
      legendary: '#FF6B35'
    };
    return colors[difficulty as keyof typeof colors] || '#4CAF50';
  };

  const getCategoryIcon = (category: string): string => {
    const icons = {
      recycling: '♻️',
      collection: '🎒',
      exploration: '🗺️',
      social: '👥',
      special: '⭐',
      daily: '📅',
      weekly: '📆',
      seasonal: '🗓️'
    };
    return icons[category as keyof typeof icons] || '🏆';
  };

  const formatTimeLeft = (hours: number): string => {
    if (hours < 24) {
      return `${hours}h left`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h left`;
  };

  const formatDate = (dateString: string): string => {
    // Prevent hydration mismatch by using a static format
    if (!mounted) return 'Loading...';
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAchievementStats = () => {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;
    const hidden = achievements.filter(a => a.hidden && !a.unlocked).length;
    const byCategory = achievements.reduce((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + (a.unlocked ? 1 : 0);
      return acc;
    }, {} as Record<string, number>);
    const byRarity = achievements.reduce((acc, a) => {
      if (a.unlocked) {
        acc[a.rarity] = (acc[a.rarity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, unlocked, hidden, byCategory, byRarity };
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (achievement.hidden && !achievement.unlocked) return false;
    if (achievementFilter === 'all') return true;
    if (achievementFilter === 'unlocked') return achievement.unlocked;
    if (achievementFilter === 'locked') return !achievement.unlocked;
    if (achievementFilter === 'hidden') return achievement.hidden;
    return achievement.category === achievementFilter || achievement.rarity === achievementFilter || achievement.difficulty === achievementFilter;
  });

  // Simulate achievement unlock animation
  const simulateUnlock = (achievementId: string) => {
    if (!mounted) return; // Prevent execution during SSR
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      setShowUnlockAnimation(achievement);
      setTimeout(() => {
        setAchievements(prev => prev.map(a =>
          a.id === achievementId ? { ...a, unlocked: true, unlockedDate: new Date().toISOString() } : a
        ));
        setTimeout(() => setShowUnlockAnimation(null), 3000);
      }, 1000);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏆</div>
          <div>Loading Achievements...</div>
        </div>
      </div>
    );
  }

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
        background: 'rgba(255,107,53,0.25)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        margin: '20px',
        color: 'white',
        padding: '24px 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '28px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          fontWeight: 'bold'
        }}>
          🏆 Achievement Center
        </h1>
        <p style={{
          margin: 0,
          opacity: 0.9,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}>
          {getAchievementStats().unlocked} / {getAchievementStats().total} Unlocked • {Math.round((getAchievementStats().unlocked / getAchievementStats().total) * 100)}% Complete
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        margin: '0 20px 20px 20px',
        display: 'flex',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        {[
          { key: 'achievements', label: 'Achievements', icon: '🏆' },
          { key: 'challenges', label: 'Challenges', icon: '⚡' },
          { key: 'badges', label: 'Badges', icon: '🏅' },
          { key: 'analytics', label: 'Analytics', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: activeTab === tab.key ? 'rgba(255,255,255,0.35)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.8)',
              fontSize: '12px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              cursor: 'pointer',
              borderRadius: activeTab === tab.key ? '16px' : '0',
              margin: activeTab === tab.key ? '8px' : '0',
              transition: 'all 0.3s ease',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ fontSize: '16px' }}>{tab.icon}</div>
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
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            {/* Achievement Filters */}
            <div style={{
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '12px'
              }}>
                {[
                  { key: 'all', label: 'All', icon: '🏆' },
                  { key: 'unlocked', label: 'Unlocked', icon: '✅' },
                  { key: 'locked', label: 'Locked', icon: '🔒' },
                  { key: 'recycling', label: 'Recycling', icon: '♻️' },
                  { key: 'collection', label: 'Collection', icon: '🎒' },
                  { key: 'exploration', label: 'Exploration', icon: '🗺️' },
                  { key: 'social', label: 'Social', icon: '👥' },
                  { key: 'special', label: 'Special', icon: '⭐' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setAchievementFilter(filter.key)}
                    style={{
                      background: achievementFilter === filter.key ? '#FF6B35' : '#f5f5f5',
                      color: achievementFilter === filter.key ? 'white' : '#333',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {filter.icon} {filter.label}
                  </button>
                ))}
              </div>

              {/* Rarity Filters */}
              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {[
                  { key: 'bronze', label: 'Bronze', color: '#CD7F32' },
                  { key: 'silver', label: 'Silver', color: '#C0C0C0' },
                  { key: 'gold', label: 'Gold', color: '#FFD700' },
                  { key: 'platinum', label: 'Platinum', color: '#E5E4E2' },
                  { key: 'diamond', label: 'Diamond', color: '#B9F2FF' },
                  { key: 'legendary', label: 'Legendary', color: '#FF6B35' }
                ].map((rarity) => (
                  <button
                    key={rarity.key}
                    onClick={() => setAchievementFilter(rarity.key)}
                    style={{
                      background: achievementFilter === rarity.key ? rarity.color : '#f5f5f5',
                      color: achievementFilter === rarity.key ? 'white' : '#333',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {rarity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Achievement Progress Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B35', marginBottom: '4px' }}>
                {getAchievementStats().unlocked} / {getAchievementStats().total}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Achievements Unlocked ({Math.round((getAchievementStats().unlocked / getAchievementStats().total) * 100)}%)
              </div>
              <div style={{
                background: '#f0f0f0',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #FF6B35, #F7931E)',
                  height: '100%',
                  width: `${(getAchievementStats().unlocked / getAchievementStats().total) * 100}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Achievements List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: achievement.unlocked ? `2px solid ${getRarityColor(achievement.rarity)}` : '2px solid rgba(255,255,255,0.3)',
                    opacity: achievement.unlocked ? 1 : 0.8,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
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
                        <h4 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: 'white',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
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
                        <span style={{
                          background: getDifficultyColor(achievement.difficulty),
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {achievement.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.9)',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}>
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
                      <span style={{ color: '#FF6B35', fontWeight: 'bold' }}>
                        , Title: "{achievement.reward.title}"
                      </span>
                    )}
                    {achievement.reward.specialReward && (
                      <span style={{ color: '#9C27B0', fontWeight: 'bold' }}>
                        , Special: {achievement.reward.specialReward}
                      </span>
                    )}
                  </div>

                  {/* Test Unlock Button (for demo) */}
                  {!achievement.unlocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        simulateUnlock(achievement.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#FF6B35',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '4px 8px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      Test Unlock
                    </button>
                  )}

                  {/* Unlock Date */}
                  {achievement.unlocked && achievement.unlockedDate && mounted && (
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

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div>
            {/* Challenge Summary */}
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>⚡ Active Challenges</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Complete daily and weekly challenges for bonus rewards
              </p>
            </div>

            {/* Challenges List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    border: challenge.completed ? '2px solid #4CAF50' : '2px solid #FF6B35',
                    opacity: challenge.completed ? 0.8 : 1
                  }}
                >
                  {/* Challenge Header */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '32px', marginRight: '12px' }}>
                      {challenge.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                          {challenge.name}
                        </h4>
                        <span style={{
                          background: challenge.type === 'daily' ? '#4CAF50' : '#2196F3',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {challenge.type.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        {challenge.description}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#FF6B35', fontWeight: 'bold' }}>
                        {formatTimeLeft(challenge.timeLeft)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      marginBottom: '4px',
                      color: '#666'
                    }}>
                      <span>Progress</span>
                      <span>{challenge.progress} / {challenge.maxProgress}</span>
                    </div>
                    <div style={{
                      background: '#e0e0e0',
                      height: '8px',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        background: challenge.completed ? '#4CAF50' : '#FF6B35',
                        height: '100%',
                        width: `${(challenge.progress / challenge.maxProgress) * 100}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Rewards */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      <strong>Rewards:</strong> {challenge.reward.ecoPoints} EcoPoints, {challenge.reward.ecoTokens} EcoTokens
                    </span>
                    {challenge.completed && (
                      <span style={{
                        background: '#4CAF50',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        COMPLETED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            {/* Badge Summary */}
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>🏅 Badge Collection</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF6B35', marginBottom: '4px' }}>
                {badges.length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Badges Collected
              </div>
            </div>

            {/* Badges Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '16px'
            }}>
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'center',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    border: `2px solid ${getRarityColor(badge.rarity)}`,
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Badge Icon */}
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '8px',
                    filter: `drop-shadow(0 2px 4px ${getRarityColor(badge.rarity)}40)`
                  }}>
                    {badge.icon}
                  </div>

                  {/* Badge Name */}
                  <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#333'
                  }}>
                    {badge.name}
                  </h4>

                  {/* Rarity */}
                  <div style={{
                    background: getRarityColor(badge.rarity),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '8px'
                  }}>
                    {badge.rarity.toUpperCase()}
                  </div>

                  {/* Description */}
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {badge.description}
                  </p>

                  {/* Unlock Date */}
                  {mounted && (
                    <div style={{
                      fontSize: '10px',
                      color: '#999'
                    }}>
                      {formatDate(badge.unlockedDate)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            {/* Analytics Summary */}
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>📊 Achievement Analytics</h3>

              {/* Category Breakdown */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Progress by Category</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(getAchievementStats().byCategory).map(([category, count]) => {
                    const total = achievements.filter(a => a.category === category).length;
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                      <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '16px', minWidth: '20px' }}>
                          {getCategoryIcon(category)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '12px',
                            marginBottom: '4px'
                          }}>
                            <span style={{ textTransform: 'capitalize' }}>{category}</span>
                            <span>{count} / {total}</span>
                          </div>
                          <div style={{
                            background: '#e0e0e0',
                            height: '6px',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              background: '#FF6B35',
                              height: '100%',
                              width: `${percentage}%`,
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', minWidth: '40px', textAlign: 'right' }}>
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rarity Breakdown */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Badges by Rarity</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px'
                }}>
                  {Object.entries(getAchievementStats().byRarity).map(([rarity, count]) => (
                    <div
                      key={rarity}
                      style={{
                        background: getRarityColor(rarity),
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{count}</div>
                      <div style={{ fontSize: '10px', textTransform: 'capitalize' }}>{rarity}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unlock Animation */}
      {showUnlockAnimation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            textAlign: 'center',
            maxWidth: '300px',
            animation: 'bounceIn 1s ease-out'
          }}>
            <div style={{
              fontSize: '80px',
              marginBottom: '16px',
              animation: 'pulse 2s infinite'
            }}>
              {showUnlockAnimation.icon}
            </div>
            <h2 style={{
              margin: '0 0 8px 0',
              color: getRarityColor(showUnlockAnimation.rarity),
              fontSize: '24px'
            }}>
              Achievement Unlocked!
            </h2>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
              {showUnlockAnimation.name}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>
              {showUnlockAnimation.description}
            </p>
            <div style={{
              background: '#f8f9fa',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px'
            }}>
              +{showUnlockAnimation.reward.ecoPoints} EcoPoints, +{showUnlockAnimation.reward.ecoTokens} EcoTokens
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
