'use client'

import React, { useEffect, useState } from 'react';

interface MissionData {
  timestamp: number;
  rewards?: {
    ecoPoints: number;
    ecoTokens: number;
  };
  ecoMon?: {
    ecoMonId: string;
    type: string;
    rarity: string;
  };
  aiAnalysis?: {
    confidence: number;
    wasteType: string;
    estimatedWeight: number;
  };
}

export default function MissionCompleteNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check for mission completion data
    const checkMissionComplete = () => {
      try {
        const storedData = localStorage.getItem('ecomonMissionComplete');
        if (storedData) {
          const data: MissionData = JSON.parse(storedData);
          
          // Check if notification is recent (within last 10 seconds)
          const timeDiff = Date.now() - data.timestamp;
          if (timeDiff < 10000) {
            setMissionData(data);
            setShowNotification(true);
            setIsAnimating(true);
            
            // Clear the stored data
            localStorage.removeItem('ecomonMissionComplete');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
              setIsAnimating(false);
              setTimeout(() => setShowNotification(false), 500);
            }, 5000);
          } else {
            // Clear old data
            localStorage.removeItem('ecomonMissionComplete');
          }
        }
      } catch (error) {
        console.error('Error checking mission completion:', error);
      }
    };

    // Check immediately and then periodically
    checkMissionComplete();
    const interval = setInterval(checkMissionComplete, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setShowNotification(false), 500);
  };

  if (!showNotification || !missionData) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      opacity: isAnimating ? 1 : 0,
      transition: 'opacity 0.5s ease'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(76,175,80,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255,215,0,0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(33,150,243,0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Notification Container */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(76,175,80,0.15) 0%, rgba(33,150,243,0.15) 100%)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255,215,0,0.3)',
        borderRadius: '24px',
        padding: '40px',
        textAlign: 'center',
        color: 'white',
        maxWidth: '400px',
        width: '100%',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
        transition: 'all 0.5s ease'
      }}>
        {/* Close Button */}
        <button
          onClick={handleClose}
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
            transition: 'all 0.3s ease'
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

        {/* Victory Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: 'victoryPulse 2s ease-in-out infinite'
        }}>
          🏆
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '32px',
          marginBottom: '16px',
          color: '#FFD700',
          textShadow: '0 2px 8px rgba(255,215,0,0.5)',
          fontWeight: 'bold'
        }}>
          MISSION ACCOMPLISHED!
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '18px',
          marginBottom: '24px',
          color: '#4CAF50',
          fontWeight: '600'
        }}>
          🎯 300 Games Accomplished
        </p>

        {/* Rewards Summary */}
        {missionData.rewards && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{
              marginBottom: '16px',
              color: 'white',
              fontSize: '18px'
            }}>Victory Rewards:</h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: '16px'
            }}>
              <div style={{
                background: 'rgba(76,175,80,0.3)',
                padding: '12px',
                borderRadius: '12px',
                flex: 1
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  +{missionData.rewards.ecoPoints}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  EcoPoints
                </div>
              </div>
              <div style={{
                background: 'rgba(33,150,243,0.3)',
                padding: '12px',
                borderRadius: '12px',
                flex: 1
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  +{missionData.rewards.ecoTokens}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  EcoTokens
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EcoMon Generated */}
        {missionData.ecoMon && (
          <div style={{
            background: 'rgba(255,107,107,0.2)',
            border: '2px solid rgba(255,107,107,0.5)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🐉</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              New EcoMon Generated!
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              {missionData.ecoMon.type} - {missionData.ecoMon.rarity}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleClose}
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA000)',
            color: '#1a1a1a',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255,215,0,0.3)',
            transition: 'all 0.3s ease',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,215,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,215,0,0.3)';
          }}
        >
          🎮 Continue Adventure
        </button>
      </div>

      <style jsx>{`
        @keyframes victoryPulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 20px rgba(255,215,0,0.5));
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 30px rgba(255,215,0,0.8));
          }
        }
      `}</style>
    </div>
  );
}
