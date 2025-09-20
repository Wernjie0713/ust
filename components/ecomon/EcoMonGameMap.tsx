'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getCurrentUser, getUserLocation } from '../../utils/auth';
import BottomNavigation from '../navigation/BottomNavigation';
import { Threebox } from 'threebox-plugin';
import { createRoot } from 'react-dom/client';
import MissionCompleteNotification from '../notifications/MissionCompleteNotification';

// EcoMon Game Map - Pokémon GO Style
// Centered on Malaysia: 3.118797763043589, 101.67396958477904

// Popup component for recycling bins
const BinPopupComponent = ({ bin, onClose }: { bin: RecyclingBin; onClose: () => void }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl font-sans max-w-sm relative overflow-hidden">

      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
            ♻️
          </div>
          <div>
            <h3 className="font-bold text-lg">{bin.name}</h3>
            <p className="text-green-100 text-sm">Recycling Station</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Capacity */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Capacity:</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
                style={{ width: `${(bin.currentLevel / bin.capacity) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-800">{bin.currentLevel}/{bin.capacity}</span>
          </div>
        </div>

        {/* Waste Types */}
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700 block mb-2">Waste Types:</span>
          <div className="flex flex-wrap gap-1">
            {bin.wasteTypes.map((type, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg mb-4">
          <div className="text-center mb-2">
            <span className="text-lg font-bold text-gray-700">🎁 Rewards</span>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-green-600">💚</span>
              <span className="font-semibold text-gray-700">{bin.rewards.ecoPoints} EcoPoints</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-600">🪙</span>
              <span className="font-semibold text-gray-700">{bin.rewards.ecoTokens} EcoTokens</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          onClick={() => {
            console.log('🗑️ Using recycling bin:', bin.name);
            // Navigate to camera page for recycling
            window.location.href = `/camera?binId=${bin.id}`;
            onClose();
          }}
        >
          📸 Scan & Recycle
        </button>
      </div>
    </div>
  );
};

interface RecyclingBin {
  id: string;
  name: string;
  coordinates: [number, number];
  wasteTypes: string[];
  capacity: number;
  currentLevel: number;
  lastEmptied: string;
  rewards: {
    ecoPoints: number;
    ecoTokens: number;
  };
  modelType: 'pokestopgrey' | 'pokestop';
  bonus?: {
    active: boolean;
    multiplier: number;
    type: 'double_points' | 'triple_points' | 'bonus_tokens' | 'rare_ecomon';
    description: string;
    expiresAt: string;
  };
}

interface EcoMon {
  id: string;
  name: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  coordinates: [number, number];
  wasteTypeAffinity: string;
  level: number;
  capturable: boolean;
  spawnTime: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const MALAYSIA_CENTER: [number, number] = [101.67396958477904, 3.118797763043589];

// Expanded recycling bins around Malaysia with bonus features
const SAMPLE_RECYCLING_BINS: RecyclingBin[] = [
  // KLCC Area
  {
    id: 'bin_001',
    name: 'KLCC Recycling Station',
    coordinates: [101.71187, 3.15833],
    wasteTypes: ['plastic', 'metal', 'paper'],
    capacity: 100,
    currentLevel: 45,
    lastEmptied: '2024-07-19T08:00:00Z',
    rewards: { ecoPoints: 50, ecoTokens: 5 },
    modelType: 'pokestopgrey',
    bonus: {
      active: true,
      multiplier: 2,
      type: 'double_points',
      description: '2x EcoPoints Weekend Bonus!',
      expiresAt: '2024-07-21T23:59:59Z'
    }
  },
  {
    id: 'bin_002',
    name: 'Bukit Bintang Green Point',
    coordinates: [101.71014, 3.14769],
    wasteTypes: ['plastic', 'glass', 'electronic'],
    capacity: 80,
    currentLevel: 30,
    lastEmptied: '2024-07-19T06:30:00Z',
    rewards: { ecoPoints: 40, ecoTokens: 4 },
    modelType: 'pokestop'
  },
  {
    id: 'bin_003',
    name: 'Pavilion Eco Hub',
    coordinates: [101.71396, 3.14906],
    wasteTypes: ['paper', 'organic', 'textile'],
    capacity: 120,
    currentLevel: 70,
    lastEmptied: '2024-07-18T20:00:00Z',
    rewards: { ecoPoints: 60, ecoTokens: 6 },
    modelType: 'pokestopgrey',
    bonus: {
      active: true,
      multiplier: 3,
      type: 'triple_points',
      description: '3x Points - Textile Drive!',
      expiresAt: '2024-07-20T18:00:00Z'
    }
  },

  // Petaling Jaya Area
  {
    id: 'bin_004',
    name: 'PJ State Library Green Corner',
    coordinates: [101.64751, 3.11560],
    wasteTypes: ['paper', 'cardboard', 'books'],
    capacity: 90,
    currentLevel: 25,
    lastEmptied: '2024-07-19T10:00:00Z',
    rewards: { ecoPoints: 45, ecoTokens: 4 },
    modelType: 'pokestop'
  },
  {
    id: 'bin_005',
    name: 'Putra World Trade Center',
    coordinates: [101.691574, 3.168658],
    wasteTypes: ['plastic', 'metal', 'glass'],
    capacity: 150,
    currentLevel: 85,
    lastEmptied: '2024-07-18T16:00:00Z',
    rewards: { ecoPoints: 70, ecoTokens: 7 },
    modelType: 'pokestopgrey',
    bonus: {
      active: true,
      multiplier: 2,
      type: 'bonus_tokens',
      description: '+5 Bonus EcoTokens!',
      expiresAt: '2024-07-22T12:00:00Z'
    }
  },
  {
    id: 'bin_006',
    name: 'One Utama Green Initiative',
    coordinates: [101.61472, 3.15000],
    wasteTypes: ['electronic', 'battery', 'metal'],
    capacity: 60,
    currentLevel: 15,
    lastEmptied: '2024-07-19T14:00:00Z',
    rewards: { ecoPoints: 80, ecoTokens: 8 },
    modelType: 'pokestop',
    bonus: {
      active: true,
      multiplier: 1,
      type: 'rare_ecomon',
      description: 'Legendary EcoMon Spotted!',
      expiresAt: '2024-07-25T18:00:00Z'
    }
  },
  
  {
    id: 'bin_016',
    name: 'Putra World Trade Center',
    coordinates: [101.691574, 3.168658],
    wasteTypes: ['plastic', 'metal', 'glass'],
    capacity: 150,
    currentLevel: 85,
    lastEmptied: '2024-07-18T16:00:00Z',
    rewards: { ecoPoints: 70, ecoTokens: 7 },
    modelType: 'pokestop',
    bonus: {
      active: true,
      multiplier: 2,
      type: 'bonus_tokens',
      description: '+5 Bonus EcoTokens!',
      expiresAt: '2024-07-22T12:00:00Z'
    }
  },

  {
    id: 'bin_007',
    name: 'Shah Alam City Centre',
    coordinates: [101.53289, 3.08507],
    wasteTypes: ['plastic', 'paper', 'organic'],
    capacity: 110,
    currentLevel: 55,
    lastEmptied: '2024-07-19T09:00:00Z',
    rewards: { ecoPoints: 55, ecoTokens: 5 },
    modelType: 'pokestopgrey'
  },
  {
    id: 'bin_008',
    name: 'i-City Eco Park',
    coordinates: [101.51667, 3.08333],
    wasteTypes: ['glass', 'plastic', 'metal'],
    capacity: 95,
    currentLevel: 40,
    lastEmptied: '2024-07-19T11:30:00Z',
    rewards: { ecoPoints: 50, ecoTokens: 5 },
    modelType: 'pokestop',
    bonus: {
      active: true,
      multiplier: 2,
      type: 'rare_ecomon',
      description: 'Rare EcoMon Spawn Boost!',
      expiresAt: '2024-07-21T06:00:00Z'
    }
  },

  // Subang Area
  {
    id: 'bin_009',
    name: 'Subang Airport Green Terminal',
    coordinates: [101.55194, 3.12639],
    wasteTypes: ['plastic', 'paper', 'electronic'],
    capacity: 130,
    currentLevel: 65,
    lastEmptied: '2024-07-18T22:00:00Z',
    rewards: { ecoPoints: 65, ecoTokens: 6 },
    modelType: 'pokestopgrey'
  },
  {
    id: 'bin_010',
    name: 'SS15 Community Recycle Hub',
    coordinates: [101.58889, 3.07500],
    wasteTypes: ['organic', 'paper', 'glass'],
    capacity: 85,
    currentLevel: 20,
    lastEmptied: '2024-07-19T15:00:00Z',
    rewards: { ecoPoints: 40, ecoTokens: 4 },
    modelType: 'pokestop'
  },

  // Ampang Area
  {
    id: 'bin_011',
    name: 'Ampang Point Eco Station',
    coordinates: [101.76028, 3.15000],
    wasteTypes: ['plastic', 'metal', 'textile'],
    capacity: 100,
    currentLevel: 50,
    lastEmptied: '2024-07-19T07:00:00Z',
    rewards: { ecoPoints: 50, ecoTokens: 5 },
    modelType: 'pokestopgrey',
    bonus: {
      active: true,
      multiplier: 2,
      type: 'double_points',
      description: '2x Points - Morning Rush!',
      expiresAt: '2024-07-20T12:00:00Z'
    }
  },
  {
    id: 'bin_012',
    name: 'Great Eastern Mall Green Corner',
    coordinates: [101.73056, 3.15833],
    wasteTypes: ['paper', 'cardboard', 'plastic'],
    capacity: 75,
    currentLevel: 35,
    lastEmptied: '2024-07-19T13:00:00Z',
    rewards: { ecoPoints: 35, ecoTokens: 3 },
    modelType: 'pokestop',
    bonus: {
      active: true,
      multiplier: 2,
      type: 'double_points',
      description: '2x EcoScore - Paper Drive!',
      expiresAt: '2024-07-23T15:00:00Z'
    }
  },

  // Cheras Area
  {
    id: 'bin_013',
    name: 'Cheras Leisure Mall Eco Hub',
    coordinates: [101.73194, 3.11667],
    wasteTypes: ['glass', 'metal', 'electronic'],
    capacity: 90,
    currentLevel: 45,
    lastEmptied: '2024-07-19T12:00:00Z',
    rewards: { ecoPoints: 45, ecoTokens: 4 },
    modelType: 'pokestopgrey'
  },
  {
    id: 'bin_014',
    name: 'Taman Connaught Night Market',
    coordinates: [101.72500, 3.10000],
    wasteTypes: ['organic', 'plastic', 'paper'],
    capacity: 120,
    currentLevel: 80,
    lastEmptied: '2024-07-18T19:00:00Z',
    rewards: { ecoPoints: 60, ecoTokens: 6 },
    modelType: 'pokestop',
    bonus: {
      active: true,
      multiplier: 3,
      type: 'triple_points',
      description: '3x Points - Night Market Special!',
      expiresAt: '2024-07-20T23:00:00Z'
    }
  },

  // Mont Kiara Area
  {
    id: 'bin_015',
    name: 'Mont Kiara Green Residences',
    coordinates: [101.65000, 3.17500],
    wasteTypes: ['plastic', 'glass', 'paper'],
    capacity: 70,
    currentLevel: 25,
    lastEmptied: '2024-07-19T16:00:00Z',
    rewards: { ecoPoints: 35, ecoTokens: 3 },
    modelType: 'pokestopgrey'
  },

  // Melaka Area - For users in Melaka
  {
    id: 'bin_016_melaka',
    name: 'Melaka Central Eco Hub',
    coordinates: [102.24997, 2.19616], // Melaka Central
    wasteTypes: ['plastic', 'metal', 'paper'],
    capacity: 120,
    currentLevel: 60,
    lastEmptied: '2024-07-19T08:00:00Z',
    rewards: { ecoPoints: 55, ecoTokens: 6 },
    modelType: 'pokestop',
    bonus: {
      active: true,
      multiplier: 2,
      type: 'double_points',
      description: '2x EcoPoints - Historic City Bonus!',
      expiresAt: '2024-07-25T18:00:00Z'
    }
  },
  {
    id: 'bin_017_melaka',
    name: 'Jonker Street Green Corner',
    coordinates: [102.24583, 2.19444], // Jonker Street area
    wasteTypes: ['paper', 'glass', 'organic'],
    capacity: 80,
    currentLevel: 35,
    lastEmptied: '2024-07-19T10:30:00Z',
    rewards: { ecoPoints: 45, ecoTokens: 5 },
    modelType: 'pokestopgrey'
  },
  {
    id: 'bin_018_melaka',
    name: 'A Famosa Recycling Station',
    coordinates: [102.24306, 2.18944], // Near A Famosa
    wasteTypes: ['plastic', 'metal', 'textile'],
    capacity: 100,
    currentLevel: 40,
    lastEmptied: '2024-07-19T09:00:00Z',
    rewards: { ecoPoints: 50, ecoTokens: 5 },
    modelType: 'pokestop',
    bonus: {
      active: true,
      multiplier: 3,
      type: 'triple_points',
      description: '3x Points - Tourist Zone Special!',
      expiresAt: '2024-07-22T15:00:00Z'
    }
  },
  {
    id: 'bin_019_melaka',
    name: 'Dataran Pahlawan Eco Point',
    coordinates: [102.24861, 2.20056], // Dataran Pahlawan area
    wasteTypes: ['electronic', 'battery', 'metal'],
    capacity: 90,
    currentLevel: 25,
    lastEmptied: '2024-07-19T14:00:00Z',
    rewards: { ecoPoints: 60, ecoTokens: 6 },
    modelType: 'pokestopgrey'
  },
  {
    id: 'bin_020_melaka',
    name: 'Melaka Gateway Green Hub',
    coordinates: [102.25278, 2.20833], // Melaka Gateway area
    wasteTypes: ['plastic', 'paper', 'glass'],
    capacity: 150,
    currentLevel: 85,
    lastEmptied: '2024-07-18T20:00:00Z',
    rewards: { ecoPoints: 70, ecoTokens: 7 },
    modelType: 'pokestop',
    bonus: {
      active: true,
      multiplier: 2,
      type: 'bonus_tokens',
      description: '+10 Bonus EcoTokens - Mall Special!',
      expiresAt: '2024-07-24T12:00:00Z'
    }
  },
  {
    id: 'bin_021_melaka',
    name: 'Taman Melaka Raya Eco Station',
    coordinates: [102.23889, 2.20278], // Taman Melaka Raya
    wasteTypes: ['organic', 'paper', 'cardboard'],
    capacity: 110,
    currentLevel: 50,
    lastEmptied: '2024-07-19T07:30:00Z',
    rewards: { ecoPoints: 50, ecoTokens: 5 },
    modelType: 'pokestopgrey'
  }
];

// Sample EcoMons spawning near recycling bins
// const SAMPLE_ECOMONS: EcoMon[] = [
//   {
//     id: 'ecomon_001',
//     name: 'PlasticEater',
//     type: 'plastic',
//     rarity: 'common',
//     coordinates: [101.71200, 3.15850],
//     wasteTypeAffinity: 'plastic',
//     level: 1,
//     capturable: true,
//     spawnTime: Date.now()
//   },
//   {
//     id: 'ecomon_002',
//     name: 'MetalCrusher',
//     type: 'metal',
//     rarity: 'uncommon',
//     coordinates: [101.71030, 3.14780],
//     wasteTypeAffinity: 'metal',
//     level: 2,
//     capturable: true,
//     spawnTime: Date.now()
//   },
  
// ];

export default function EcoMonGameMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [recyclingBins] = useState<RecyclingBin[]>(SAMPLE_RECYCLING_BINS);
  // const [ecoMons] = useState<EcoMon[]>(SAMPLE_ECOMONS);
  const [selectedBin, setSelectedBin] = useState<RecyclingBin | null>(null);
  const [selectedBinCoord, setSelectedBinCoord] = useState<[number, number] | null>(null);
  const [selectedEcoMon, setSelectedEcoMon] = useState<EcoMon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBonusOnly, setShowBonusOnly] = useState(false);
  const [popup, setPopup] = useState<mapboxgl.Popup | null>(null);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [isNotificationFading, setIsNotificationFading] = useState(false);

  // Notification messages that cycle every 3 seconds
  const notificationMessages = [
    "🎯 New recycling bin collaboration available!",
    "⚡ 2x EcoPoints hour is now active!",
    "🌟 Rare EcoMon spotted in Kuala Lumpur!",
    "🏆 Weekly recycling challenge starts tomorrow!",
    "💰 Bonus EcoTokens for plastic recycling today!",
    "🔥 3x points multiplier at KLCC area!",
    "🌱 New eco-friendly rewards unlocked!",
    "📍 5 new recycling stations added to the map!",
    "🎉 Community goal: 1000 bottles recycled!",
    "⭐ Special weekend bonus event active!",
    "🚀 Level up faster with today's challenges!",
    "🌍 Earth Day special: Double rewards!",
    "💎 Legendary EcoMon available for capture!",
    "🎁 Mystery reward boxes found near you!",
    "🔋 Battery recycling campaign launched!",
    "🌊 Ocean cleanup event participation rewards!",
    "🏅 Achievement unlocked: Eco Warrior badge!",
    "📱 New mobile recycling alerts enabled!",
    "🌈 Rainbow EcoMon migration happening now!",
    "🎊 Celebrate 10,000 recycled items milestone!"
  ];

  // Using proximity-based click detection instead of 3D model events

  // Function to get notification color based on content and index for variety
  const getNotificationColor = (message: string, index: number): string => {
    // Base colors array for variety
    const colorPalette = [
      'linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%)', // Green
      'linear-gradient(135deg, rgba(33, 150, 243, 0.95) 0%, rgba(21, 101, 192, 0.95) 100%)', // Blue
      'linear-gradient(135deg, rgba(156, 39, 176, 0.95) 0%, rgba(103, 58, 183, 0.95) 100%)', // Purple
      'linear-gradient(135deg, rgba(255, 193, 7, 0.95) 0%, rgba(255, 152, 0, 0.95) 100%)', // Gold
      'linear-gradient(135deg, rgba(255, 87, 34, 0.95) 0%, rgba(244, 67, 54, 0.95) 100%)', // Red-Orange
      'linear-gradient(135deg, rgba(0, 188, 212, 0.95) 0%, rgba(0, 151, 167, 0.95) 100%)', // Cyan
      'linear-gradient(135deg, rgba(233, 30, 99, 0.95) 0%, rgba(194, 24, 91, 0.95) 100%)', // Pink
      'linear-gradient(135deg, rgba(121, 85, 72, 0.95) 0%, rgba(93, 64, 55, 0.95) 100%)', // Brown
    ];

    // Content-based color overrides for special messages
    if (message.includes('RARE') || message.includes('LEGENDARY') || message.includes('💎')) {
      return 'linear-gradient(135deg, rgba(156, 39, 176, 0.95) 0%, rgba(103, 58, 183, 0.95) 100%)'; // Purple for rare
    } else if (message.includes('LIMITED TIME') || message.includes('Flash Sale') || message.includes('🔥')) {
      return 'linear-gradient(135deg, rgba(255, 87, 34, 0.95) 0%, rgba(244, 67, 54, 0.95) 100%)'; // Red for urgent
    } else if (message.includes('Event') || message.includes('Tournament') || message.includes('🏆')) {
      return 'linear-gradient(135deg, rgba(255, 193, 7, 0.95) 0%, rgba(255, 152, 0, 0.95) 100%)'; // Gold for events
    } else {
      // Use index-based color for variety
      return colorPalette[index % colorPalette.length];
    }
  };

  // Enhanced notification cycling with fade transitions
  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out animation
      setIsNotificationFading(true);

      setTimeout(() => {
        // Change to next notification
        setCurrentNotificationIndex((prevIndex) =>
          (prevIndex + 1) % notificationMessages.length
        );
        setIsNotificationFading(false);
      }, 300); // Fade duration
    }, 4000); // 4 seconds between changes

    return () => clearInterval(interval);
  }, [currentNotificationIndex, notificationMessages.length]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Set Mapbox access token
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoic2VuYXRyYWZmaWMiLCJhIjoiY2xoZnBxN3A1MTQzbDNlbWhrZm13N2NydCJ9.xYXij-gGCw3oXzGvydiwqA';

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Street view style
        center: MALAYSIA_CENTER,
        zoom: 15,
        pitch: 45, // 3D-like view
        bearing: 0,
        antialias: true
      });

      map.current.on('load', () => {
        console.log('🗺️ EcoMon Game Map loaded!');
        setIsLoading(false);

        // Initialize Threebox
        console.log('🔧 Initializing Threebox...');
        try {
          (window as any).tb = new Threebox(
            map.current!,
            map.current!.getCanvas().getContext('webgl'),
            {
              defaultLights: true,
              enableSelectingFeatures: true,
              enableSelectingObjects: true
            }
          );
          console.log('✅ Threebox initialized successfully');

          // Add 3D pokestop models to map
          console.log('🏪 Adding 3D pokestops to map...');
          add3DPokestopsToMap();

          // Note: Using proximity-based click detection instead of 3D model events

          // Simple map click handler - just proximity detection for now
          map.current!.on('click', (e) => {
            console.log('🗺️ Map clicked at:', e.lngLat);

            // Check if click is near any recycling bin with MUCH larger detection radius
            recyclingBins.forEach(bin => {
              const distance = Math.sqrt(
                Math.pow(e.lngLat.lng - bin.coordinates[0], 2) +
                Math.pow(e.lngLat.lat - bin.coordinates[1], 2)
              );

              console.log(`📏 Distance to ${bin.name}:`, distance);

              // If click is within ~200 meters of a bin (MUCH larger detection area)
              if (distance < 0.002) {
                console.log('🎯 Click detected near bin:', bin.name);

                // Use the beautiful React component popup system
                setSelectedBin(bin);
                setSelectedBinCoord(bin.coordinates);
              }
            });
          });

        } catch (error) {
          console.error('❌ Failed to initialize Threebox:', error);
          // Fallback to regular markers
          addRecyclingBinsToMap();
        }

        // Add EcoMons to map
        // addEcoMonsToMap();

        // Get user location
        getUserCurrentLocation();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setIsLoading(false);
    }

    return () => {
      // No cleanup needed for proximity-based detection

      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Get user's current location
  const getUserCurrentLocation = useCallback(async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);

      // Add user marker to map
      if (map.current) {
        // Remove existing user marker
        const existingMarker = document.getElementById('user-marker');
        if (existingMarker) {
          existingMarker.remove();
        }

        // Create user avatar marker
        const userMarker = new mapboxgl.Marker({
          element: createUserAvatarElement(),
          anchor: 'center'
        })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map.current);

        // Center map on user location
        map.current.flyTo({
          center: [location.longitude, location.latitude],
          zoom: 16,
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      // Fallback to Malaysia center
      setUserLocation({
        latitude: MALAYSIA_CENTER[1],
        longitude: MALAYSIA_CENTER[0]
      });
    }
  }, []);

  // Create user avatar element
  const createUserAvatarElement = (): HTMLElement => {
    const el = document.createElement('div');
    el.id = 'user-marker';
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#4CAF50';
    el.style.border = '3px solid #ffffff';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontSize = '20px';
    el.innerHTML = '🧑‍🌾'; // Eco warrior emoji
    return el;
  };



  // Add 3D pokestop models to map
  const add3DPokestopsToMap = () => {
    if (!map.current) {
      console.error('❌ Map not available for 3D pokestops');
      return;
    }

    if (!(window as any).tb) {
      console.error('❌ Threebox not initialized for 3D pokestops');
      return;
    }

    console.log('🏪 Adding pokestop layer with', recyclingBins.length, 'bins');

    // Add a custom layer for 3D models
    map.current.addLayer({
      id: 'pokestop-layer',
      type: 'custom',
      renderingMode: '3d',
      onAdd: function () {
        console.log('🔧 Pokestop layer onAdd called');
        recyclingBins.forEach((bin, index) => {
          console.log(`🏪 Loading ${bin.modelType} model ${index + 1}/${recyclingBins.length} for bin:`, bin.name);

          // Use the modelType from the bin to determine which model to load
          const modelPath = bin.modelType === 'pokestopgrey' ? 'pokestopgrey/pokestopgrey.glb' : 'pokestop/pokestop.glb';
          const modelSize = bin.modelType === 'pokestopgrey' ? 60 : 350;
          const options = {
            obj: modelPath,
            type: 'glb',
            scale: modelSize,
            units: 'meters',
            rotation: { x: 90, y: 50, z: 0 },
            anchor: 'center',
            bbox: false
          };

          if ((window as any).tb) {
            (window as any).tb.loadObj(options, function (model: any) {
              console.log(`✅ ${bin.modelType} model loaded for bin:`, bin.name);
              const pokestop = model.setCoords(bin.coordinates);

              // Add continuous rotation animation
              const animate = () => {
                if (pokestop && pokestop.object) {
                  pokestop.object.rotation.z += 0.01; // Rotate around Z axis
                }
                requestAnimationFrame(animate);
              };
              animate();

              // Store bin data in the object for later retrieval
              if (pokestop.object) {
                pokestop.object.userData = { bin: bin };
              }

              // Add to threebox
              if ((window as any).tb) {
                (window as any).tb.add(pokestop);
                console.log(`✅ ${bin.modelType} added to threebox for bin:`, bin.name);


              }

            }).catch((error: any) => {
              console.error(`❌ Error loading ${bin.modelType} model for bin:`, bin.name, error);
            });
          }
        });
      },
      render: function () {
        if ((window as any).tb) {
          (window as any).tb.update();
        }
      }
    });
  };



  // Create floating hint element
  const createFloatingHint = (bin: RecyclingBin): HTMLElement => {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.pointerEvents = 'none'; // Don't interfere with pokestop clicks
    container.style.transform = 'translate(-50%, -50%)'; // Center the hint perfectly

    const hint = document.createElement('div');
    hint.style.cssText = `
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.95) 0%, rgba(255, 165, 0, 0.95) 100%);
      color: #1a1a1a;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.8);
      animation: floatHint 3s ease-in-out infinite;
      white-space: nowrap;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      min-width: 40px;
      max-width: 60px;
      display: inline-block;
    `;

    // Set hint text based on bonus type
    let hintText = '';
    let hintColor = '';

    switch (bin.bonus?.type) {
      case 'double_points':
        hintText = '2x 🎯';
        hintColor = 'linear-gradient(135deg, rgba(76, 175, 80, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%)';
        break;
      case 'triple_points':
        hintText = '3x 🔥';
        hintColor = 'linear-gradient(135deg, rgba(255, 87, 34, 0.95) 0%, rgba(244, 67, 54, 0.95) 100%)';
        break;
      case 'bonus_tokens':
        hintText = '+5 🪙';
        hintColor = 'linear-gradient(135deg, rgba(255, 193, 7, 0.95) 0%, rgba(255, 152, 0, 0.95) 100%)';
        break;
      case 'rare_ecomon':
        hintText = '⭐ RARE';
        hintColor = 'linear-gradient(135deg, rgba(156, 39, 176, 0.95) 0%, rgba(103, 58, 183, 0.95) 100%)';
        break;
      default:
        hintText = '✨';
    }

    hint.textContent = hintText;
    if (hintColor) {
      hint.style.background = hintColor;
    }

    // Add special styling for legendary monster hints
    if (bin.bonus?.type === 'rare_ecomon') {
      hint.style.color = '#ffffff';
      hint.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
      hint.style.border = '2px solid rgba(255, 215, 0, 0.8)';
      hint.style.boxShadow = '0 4px 16px rgba(156, 39, 176, 0.4), 0 0 20px rgba(156, 39, 176, 0.2)';
    }

    container.appendChild(hint);
    return container;
  };

  // Function to show popup for a bin using React component
  const showPopupForBin = (bin: RecyclingBin) => {
    console.log('📋 Showing popup for bin:', bin.name);
    setSelectedBin(bin);
  };

  // useEffect to handle popup rendering with React component (like cpPopup pattern)
  useEffect(() => {
    console.log('🔄 Popup useEffect triggered:', { selectedBin: selectedBin?.name, selectedBinCoord, hasMap: !!map.current });

    if (selectedBin && selectedBinCoord && map.current) {
      try {
        console.log('📋 Creating popup for bin:', selectedBin.name);

        // Close existing popup
        if (popup) {
          console.log('🗑️ Removing existing popup');
          popup.remove();
        }

        // Create popup container
        const popupContainer = document.createElement('div');

        // Create new popup that follows the coordinates
        const newPopup = new mapboxgl.Popup({
          closeButton: true, // Enable Mapbox close button - it actually works!
          closeOnClick: false,
          maxWidth: '340px'
        })

        // Style the close button to be bigger
        newPopup.on('open', () => {
          const closeButton = document.querySelector('.mapboxgl-popup-close-button') as HTMLElement;
          if (closeButton) {
            closeButton.style.fontSize = '24px';
            closeButton.style.width = '32px';
            closeButton.style.height = '32px';
            closeButton.style.lineHeight = '32px';
            closeButton.style.fontWeight = 'bold';
            closeButton.style.borderRadius = '50%';
            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            closeButton.style.color = '#374151';
            closeButton.style.border = '2px solid #e5e7eb';
            closeButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            closeButton.style.transition = 'all 0.2s ease';
            closeButton.style.display = 'flex';
            closeButton.style.alignItems = 'center';
            closeButton.style.justifyContent = 'center';

            // Add hover effects
            closeButton.addEventListener('mouseenter', () => {
              closeButton.style.backgroundColor = '#f3f4f6';
              closeButton.style.transform = 'scale(1.1)';
            });

            closeButton.addEventListener('mouseleave', () => {
              closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              closeButton.style.transform = 'scale(1)';
            });
          }
        })
        .setLngLat(selectedBinCoord)
        .setDOMContent(popupContainer)
        .addTo(map.current);

        console.log('✅ Popup created and added to map');

        // Render React component into popup
        try {
          const root = createRoot(popupContainer);
          root.render(
            <BinPopupComponent
              bin={selectedBin}
              onClose={() => {
                console.log('🔒 Popup close button clicked');
                setSelectedBin(null);
                setSelectedBinCoord(null);
              }}
            />
          );
          console.log('✅ React component rendered into popup');
        } catch (renderError) {
          console.error('❌ Error rendering React component:', renderError);
        }

        setPopup(newPopup);

        // Handle popup close
        newPopup.on('close', () => {
          console.log('🔒 Popup closed via X button');
          setSelectedBin(null);
          setSelectedBinCoord(null);
          setPopup(null);
        });

      } catch (error) {
        console.error('❌ Error creating popup:', error);
      }
    }
  }, [selectedBin, selectedBinCoord]);

  // Add recycling bins to map (keeping original for fallback)
  const addRecyclingBinsToMap = () => {
    if (!map.current) return;

    recyclingBins.forEach((bin) => {
      const binElement = createRecyclingBinElement(bin);

      new mapboxgl.Marker({
        element: binElement,
        anchor: 'bottom'
      })
      .setLngLat(bin.coordinates)
      .addTo(map.current!);

      // Add click handler
      binElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedBin(bin);
        showBinPopup(bin);
      });
    });
  };

  // Create recycling bin element
  const createRecyclingBinElement = (bin: RecyclingBin): HTMLElement => {
    // Outer container - NO transform on this element
    const el = document.createElement('div');
    el.style.width = '50px';
    el.style.height = '60px';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    el.style.cursor = 'pointer';

    // Inner container - transform this instead
    const innerContainer = document.createElement('div');
    innerContainer.style.display = 'flex';
    innerContainer.style.flexDirection = 'column';
    innerContainer.style.alignItems = 'center';
    innerContainer.style.transition = 'transform 0.2s';

    // Bin icon with 3D model
    const binIcon = document.createElement('div');
    binIcon.style.width = '40px';
    binIcon.style.height = '40px';
    binIcon.style.backgroundColor = getBinColor(bin.currentLevel, bin.capacity);
    binIcon.style.borderRadius = '8px';
    binIcon.style.display = 'flex';
    binIcon.style.alignItems = 'center';
    binIcon.style.justifyContent = 'center';
    binIcon.style.fontSize = '24px';
    binIcon.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    binIcon.style.overflow = 'hidden';

    // Create 3D model iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://sketchfab.com/models/a819239b0ec14269b031e750d8c823f2/embed?autostart=1&ui_controls=0&ui_infos=0&ui_stop=0&ui_watermark=0&ui_annotations=0&ui_fullscreen=0&ui_vr=0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.title = 'Pokemon Go Plus';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('mozallowfullscreen', 'true');
    iframe.setAttribute('webkitallowfullscreen', 'true');
    iframe.setAttribute('allow', 'autoplay; fullscreen; xr-spatial-tracking');

    binIcon.appendChild(iframe);

    // Capacity indicator
    const capacityBar = document.createElement('div');
    capacityBar.style.width = '30px';
    capacityBar.style.height = '4px';
    capacityBar.style.backgroundColor = '#e0e0e0';
    capacityBar.style.borderRadius = '2px';
    capacityBar.style.marginTop = '4px';
    capacityBar.style.overflow = 'hidden';

    const capacityFill = document.createElement('div');
    capacityFill.style.width = `${(bin.currentLevel / bin.capacity) * 100}%`;
    capacityFill.style.height = '100%';
    capacityFill.style.backgroundColor = getBinColor(bin.currentLevel, bin.capacity);
    capacityFill.style.transition = 'width 0.3s';

    capacityBar.appendChild(capacityFill);
    innerContainer.appendChild(binIcon);
    innerContainer.appendChild(capacityBar);
    el.appendChild(innerContainer);

    // Hover effect - transform inner container, not the marker element
    el.addEventListener('mouseenter', () => {
      innerContainer.style.transform = 'scale(1.1)';
    });

    el.addEventListener('mouseleave', () => {
      innerContainer.style.transform = 'scale(1)';
    });

    return el;
  };

  // Get bin color based on capacity
  const getBinColor = (currentLevel: number, capacity: number): string => {
    const percentage = (currentLevel / capacity) * 100;
    if (percentage < 30) return '#4CAF50'; // Green - low
    if (percentage < 70) return '#FF9800'; // Orange - medium
    return '#F44336'; // Red - high
  };

  // Add EcoMons to map
  // const addEcoMonsToMap = () => {
  //   if (!map.current) return;

  //   ecoMons.forEach((ecomon) => {
  //     const ecomonElement = createEcoMonElement(ecomon);

  //     new mapboxgl.Marker({
  //       element: ecomonElement,
  //       anchor: 'center'
  //     })
  //     .setLngLat(ecomon.coordinates)
  //     .addTo(map.current!);

  //     // Add click handler
  //     ecomonElement.addEventListener('click', (e) => {
  //       e.preventDefault();
  //       e.stopPropagation();
  //       setSelectedEcoMon(ecomon);
  //       showEcoMonPopup(ecomon);
  //     });
  //   });
  // };

  // Create EcoMon element
  const createEcoMonElement = (ecomon: EcoMon): HTMLElement => {
    const el = document.createElement('div');
    el.style.width = '50px';
    el.style.height = '50px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'pointer';
    el.style.animation = 'bounce 2s infinite';

    // EcoMon icon based on type
    const ecomonIcon = document.createElement('div');
    ecomonIcon.style.width = '40px';
    ecomonIcon.style.height = '40px';
    ecomonIcon.style.borderRadius = '50%';
    ecomonIcon.style.backgroundColor = getEcoMonColor(ecomon.rarity);
    ecomonIcon.style.border = '3px solid #ffffff';
    ecomonIcon.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
    ecomonIcon.style.display = 'flex';
    ecomonIcon.style.alignItems = 'center';
    ecomonIcon.style.justifyContent = 'center';
    ecomonIcon.style.fontSize = '20px';
    ecomonIcon.innerHTML = getEcoMonEmoji(ecomon.type);

    // Rarity glow effect
    if (ecomon.rarity === 'rare' || ecomon.rarity === 'epic' || ecomon.rarity === 'legendary') {
      ecomonIcon.style.boxShadow = `0 0 20px ${getEcoMonColor(ecomon.rarity)}`;
    }

    el.appendChild(ecomonIcon);

    // Hover effect - use filter and box-shadow instead of transform to avoid position changes
    el.addEventListener('mouseenter', () => {
      ecomonIcon.style.filter = 'brightness(1.2) drop-shadow(0 4px 16px rgba(0,0,0,0.5))';
      ecomonIcon.style.boxShadow = `0 0 25px ${getEcoMonColor(ecomon.rarity)}, 0 4px 16px rgba(0,0,0,0.5)`;
    });

    el.addEventListener('mouseleave', () => {
      ecomonIcon.style.filter = 'brightness(1) drop-shadow(0 2px 12px rgba(0,0,0,0.4))';
      if (ecomon.rarity === 'rare' || ecomon.rarity === 'epic' || ecomon.rarity === 'legendary') {
        ecomonIcon.style.boxShadow = `0 0 20px ${getEcoMonColor(ecomon.rarity)}`;
      } else {
        ecomonIcon.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
      }
    });

    return el;
  };

  // Get EcoMon color based on rarity
  const getEcoMonColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '#9E9E9E';
      case 'uncommon': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  // Get EcoMon emoji based on type
  const getEcoMonEmoji = (type: string): string => {
    switch (type) {
      case 'plastic': return '🦎';
      case 'metal': return '🦾';
      case 'glass': return '💎';
      case 'paper': return '📄';
      case 'organic': return '🌱';
      case 'electronic': return '⚡💎';
      default: return '🐉';
    }
  };

  // Get waste type color and icon
  const getWasteTypeStyle = (type: string) => {
    const styles = {
      plastic: { color: '#2196F3', bg: '#E3F2FD', icon: '♻️' },
      metal: { color: '#9E9E9E', bg: '#F5F5F5', icon: '🔩' },
      paper: { color: '#8BC34A', bg: '#F1F8E9', icon: '📄' },
      glass: { color: '#00BCD4', bg: '#E0F2F1', icon: '🍶' },
      organic: { color: '#FF9800', bg: '#FFF3E0', icon: '🍃' }
    };
    return styles[type as keyof typeof styles] || { color: '#757575', bg: '#F5F5F5', icon: '♻️' };
  };

  // Show bin popup
  const showBinPopup = (bin: RecyclingBin) => {
    if (!map.current) return;

    new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '320px',
      className: 'modern-recycling-popup'
    })
    .setLngLat(bin.coordinates)
    .setHTML(`
      <div style="
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.08);
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
          padding: 20px;
          color: white;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              background: rgba(255,255,255,0.2);
              border-radius: 12px;
              padding: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="font-size: 24px;">♻️</span>
            </div>
            <div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${bin.name}</h3>
              <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Recycling Station</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 20px;">
          <!-- Waste Types -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; color: #333; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Accepted Materials
            </h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${bin.wasteTypes.map(type => {
                const style = getWasteTypeStyle(type);
                return `<span style="
                  background: ${style.bg};
                  color: ${style.color};
                  padding: 6px 12px;
                  border-radius: 20px;
                  font-size: 13px;
                  font-weight: 500;
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  border: 1px solid ${style.color}20;
                ">
                  <span>${style.icon}</span>
                  ${type.charAt(0).toUpperCase() + type.slice(1)}
                </span>`;
              }).join('')}
            </div>
          </div>

          <!-- Capacity -->
          <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 style="margin: 0; color: #333; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                Capacity
              </h4>
              <span style="color: #666; font-size: 13px; font-weight: 500;">
                ${bin.currentLevel}/${bin.capacity} (${Math.round((bin.currentLevel/bin.capacity)*100)}%)
              </span>
            </div>
            <div style="
              background: #F5F5F5;
              height: 12px;
              border-radius: 6px;
              overflow: hidden;
              position: relative;
            ">
              <div style="
                background: linear-gradient(90deg, ${getBinColor(bin.currentLevel, bin.capacity)} 0%, ${getBinColor(bin.currentLevel, bin.capacity)}CC 100%);
                height: 100%;
                width: ${(bin.currentLevel/bin.capacity)*100}%;
                border-radius: 6px;
                transition: width 0.3s ease;
              "></div>
            </div>
          </div>

          <!-- Rewards -->
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; color: #333; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Rewards
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="
                background: #FFF3E0;
                border: 1px solid #FFB74D20;
                border-radius: 12px;
                padding: 12px;
                text-align: center;
              ">
                <div style="font-size: 20px; margin-bottom: 4px;">🏆</div>
                <div style="font-weight: 600; color: #F57C00; font-size: 16px;">${bin.rewards.ecoPoints}</div>
                <div style="font-size: 12px; color: #666;">EcoPoints</div>
              </div>
              <div style="
                background: #E8F5E8;
                border: 1px solid #4CAF5020;
                border-radius: 12px;
                padding: 12px;
                text-align: center;
              ">
                <div style="font-size: 20px; margin-bottom: 4px;">🪙</div>
                <div style="font-weight: 600; color: #2E7D32; font-size: 16px;">${bin.rewards.ecoTokens}</div>
                <div style="font-size: 12px; color: #666;">EcoTokens</div>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button
            onclick="window.openRecyclingCamera('${bin.id}')"
            style="
              background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
              color: white;
              border: none;
              padding: 16px 24px;
              border-radius: 12px;
              cursor: pointer;
              font-size: 16px;
              font-weight: 600;
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              transition: all 0.2s ease;
              box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76, 175, 80, 0.4)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(76, 175, 80, 0.3)'"
          >
            <span style="font-size: 18px;">📷</span>
            Start Recycling
          </button>
        </div>
      </div>
    `)
    .addTo(map.current);
  };

  // Show EcoMon popup
  const showEcoMonPopup = (ecomon: EcoMon) => {
    if (!map.current) return;

    new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '300px',
      className: 'custom-popup'
    })
    .setLngLat(ecomon.coordinates)
    .setHTML(`
      <div style="
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
        border-radius: 16px;
        position: relative;
        text-align: center;
      ">
        <div style="font-size: 56px; margin-bottom: 12px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">
          ${getEcoMonEmoji(ecomon.type)}
        </div>

        <h3 style="
          margin: 0 0 12px 0;
          color: ${getEcoMonColor(ecomon.rarity)};
          font-size: 22px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        ">
          ${ecomon.name}
        </h3>

        <div style="
          background: linear-gradient(135deg, ${getEcoMonColor(ecomon.rarity)} 0%, ${getEcoMonColor(ecomon.rarity)}dd 100%);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        ">
          ${ecomon.rarity}
        </div>

        <div style="margin-bottom: 20px;">
          <div style="display: flex; flex-direction: column; gap: 8px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #475569; font-size: 14px;">Level:</span>
              <span style="
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                color: #92400e;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid #fbbf24;
              ">${ecomon.level}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #475569; font-size: 14px;">Type:</span>
              <span style="
                background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
                color: #0277bd;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                border: 1px solid #4fc3f7;
              ">${ecomon.wasteTypeAffinity}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: #475569; font-size: 14px;">Status:</span>
              <span style="
                background: ${ecomon.capturable ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)'};
                color: ${ecomon.capturable ? '#166534' : '#991b1b'};
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid ${ecomon.capturable ? '#86efac' : '#fca5a5'};
              ">${ecomon.capturable ? '✅ Ready' : '⏰ Not Ready'}</span>
            </div>
          </div>
        </div>

        <button
          onclick="window.captureEcoMon('${ecomon.id}')"
          style="
            background: ${ecomon.capturable ? `linear-gradient(135deg, ${getEcoMonColor(ecomon.rarity)} 0%, ${getEcoMonColor(ecomon.rarity)}dd 100%)` : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'};
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 12px;
            cursor: ${ecomon.capturable ? 'pointer' : 'not-allowed'};
            font-size: 16px;
            width: 100%;
            font-weight: 600;
            box-shadow: 0 4px 12px ${ecomon.capturable ? `rgba(${getEcoMonColor(ecomon.rarity).replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.3)` : 'rgba(156, 163, 175, 0.3)'};
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            opacity: ${ecomon.capturable ? '1' : '0.7'};
          "
          ${ecomon.capturable ? `onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(${getEcoMonColor(ecomon.rarity).replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.4)';" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 12px rgba(${getEcoMonColor(ecomon.rarity).replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(', ')}, 0.3)';"` : ''}
          ${!ecomon.capturable ? 'disabled' : ''}
        >
          ${ecomon.capturable ? '🎯 Capture EcoMon' : '⏰ Not Ready'}
        </button>
      </div>
    `)
    .addTo(map.current);
  };

  // Global functions for popup buttons
  useEffect(() => {
    // Add global functions to window for popup buttons
    (window as any).openRecyclingCamera = (binId: string) => {
      console.log('📸 Opening camera for bin:', binId);
      // Navigate to camera page
      window.location.href = `/camera?binId=${binId}`;
    };

    (window as any).captureEcoMon = (ecomonId: string) => {
      console.log('🎯 Capturing EcoMon:', ecomonId);
      // TODO: Start capture sequence
      alert(`Attempting to capture EcoMon: ${ecomonId}`);
    };

    return () => {
      // Cleanup global functions
      delete (window as any).openRecyclingCamera;
      delete (window as any).captureEcoMon;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '40px',
            color: 'white',
            fontSize: '24px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}>🗺️</div>
            <div style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontWeight: 'bold'
            }}>Loading EcoMon World...</div>
          </div>
        </div>
      )}



      {/* Game UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 100
      }}>
        {/* Top Status Bar */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto'
        }}>
          {/* User Info */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0,0,0,0.1)',
            padding: '12px 16px',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '24px' }}>🧑‍🌾</div>
            <div>
              <div style={{
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#1f2937',
                textShadow: 'none'
              }}>
                {typeof window !== 'undefined' ? (getCurrentUser()?.displayName || 'EcoWarrior') : 'EcoWarrior'}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                textShadow: 'none'
              }}>
                Level {typeof window !== 'undefined' ? (getCurrentUser()?.level || 1) : 1} • {typeof window !== 'undefined' ? (getCurrentUser()?.ecoPoints || 0) : 0} EcoPoints
              </div>
            </div>
          </div>

          {/* Location Button */}
          <button
            onClick={getUserCurrentLocation}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📍
          </button>
        </div>


      </div>

      {/* Popup is now rendered as Mapbox popup via useEffect */}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes floatHint {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.9;
          }
          25% {
            transform: translateY(-8px) scale(1.05);
            opacity: 1;
          }
          50% {
            transform: translateY(-4px) scale(1.02);
            opacity: 0.95;
          }
          75% {
            transform: translateY(-6px) scale(1.03);
            opacity: 1;
          }
        }

        @keyframes slideInFromTop {
          0% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          100% {
            transform: translateX(-50%) translateY(0);
            opacity: 0.8;
          }
        }

        @keyframes fadeFloatInOut {
          0% {
            transform: translateX(-50%) translateY(50px);
            opacity: 0;
          }
          10% {
            transform: translateX(-50%) translateY(0px);
            opacity: 1;
          }
          90% {
            transform: translateX(-50%) translateY(0px);
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
        }
      `}</style>


      {/* Current Notification Banner - Above Navigation */}
      {!isLoading && (
        <div style={{
          position: 'fixed',
          bottom: '160px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: getNotificationColor(notificationMessages[currentNotificationIndex], currentNotificationIndex),
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          zIndex: 999,
          opacity: isNotificationFading ? 0.3 : 1,
          transition: 'opacity 0.3s ease-in-out',
          animation: isNotificationFading ? 'none' : 'fadeFloatInOut 4s ease-in-out',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          width: 'calc(100% - 40px)'
        }}>
          {notificationMessages[currentNotificationIndex]}
        </div>
      )}

      {/* Mission Complete Notification */}
      <MissionCompleteNotification />

      {/* Standard Bottom Navigation */}
      <BottomNavigation currentPage="recycle" />
    </div>
  );
}
