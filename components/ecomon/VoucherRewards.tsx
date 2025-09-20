'use client'

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../utils/auth';

// Voucher Rewards - Trade Battle Wins for Digital Vouchers

interface Voucher {
  id: string;
  title: string;
  description: string;
  brand: string;
  value: string;
  battleWinsRequired: number;
  category: 'food' | 'shopping' | 'entertainment' | 'eco' | 'transport';
  expiryDate: string;
  termsAndConditions: string[];
  brandLogo: string;
  backgroundColor: string;
  textColor: string;
  isRedeemed: boolean;
  redeemedAt?: string;
  qrCode?: string;
}

interface UserStats {
  totalBattleWins: number;
  availableWins: number;
  totalVouchersClaimed: number;
  totalValueClaimed: string;
}

// Sample vouchers for demo
const SAMPLE_VOUCHERS: Voucher[] = [
  {
    id: 'voucher_001',
    title: 'RM10 OFF',
    description: 'Get RM10 off your next purchase',
    brand: 'EcoMart',
    value: 'RM10',
    battleWinsRequired: 5,
    category: 'shopping',
    expiryDate: '2024-12-31',
    termsAndConditions: [
      'Valid for purchases above RM50',
      'Cannot be combined with other offers',
      'Valid at all EcoMart outlets'
    ],
    brandLogo: '🛒',
    backgroundColor: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
    textColor: 'white',
    isRedeemed: false
  },
  {
    id: 'voucher_002',
    title: 'Free Coffee',
    description: 'Complimentary coffee of your choice',
    brand: 'Green Bean Café',
    value: 'RM8',
    battleWinsRequired: 3,
    category: 'food',
    expiryDate: '2024-11-30',
    termsAndConditions: [
      'Valid for any coffee size',
      'One voucher per visit',
      'Valid at participating outlets only'
    ],
    brandLogo: '☕',
    backgroundColor: 'linear-gradient(135deg, #8D6E63, #5D4037)',
    textColor: 'white',
    isRedeemed: false
  },
  {
    id: 'voucher_003',
    title: '20% OFF',
    description: 'Save 20% on eco-friendly products',
    brand: 'Sustainable Store',
    value: '20%',
    battleWinsRequired: 8,
    category: 'eco',
    expiryDate: '2024-12-15',
    termsAndConditions: [
      'Valid on eco-friendly products only',
      'Maximum discount RM50',
      'Valid for online and in-store purchases'
    ],
    brandLogo: '🌱',
    backgroundColor: 'linear-gradient(135deg, #66BB6A, #388E3C)',
    textColor: 'white',
    isRedeemed: false
  },
  {
    id: 'voucher_004',
    title: 'Free Movie Ticket',
    description: 'Complimentary movie ticket',
    brand: 'CinemaMax',
    value: 'RM15',
    battleWinsRequired: 10,
    category: 'entertainment',
    expiryDate: '2024-12-31',
    termsAndConditions: [
      'Valid for 2D movies only',
      'Subject to seat availability',
      'Valid Monday to Thursday only'
    ],
    brandLogo: '🎬',
    backgroundColor: 'linear-gradient(135deg, #E91E63, #AD1457)',
    textColor: 'white',
    isRedeemed: false
  },
  {
    id: 'voucher_005',
    title: 'RM5 Grab Credit',
    description: 'RM5 credit for your next ride',
    brand: 'Grab',
    value: 'RM5',
    battleWinsRequired: 4,
    category: 'transport',
    expiryDate: '2024-11-15',
    termsAndConditions: [
      'Valid for GrabCar and GrabBike',
      'Minimum fare RM10',
      'One-time use only'
    ],
    brandLogo: '🚗',
    backgroundColor: 'linear-gradient(135deg, #00C851, #007E33)',
    textColor: 'white',
    isRedeemed: false
  }
];

// Simple QR Code SVG generator (basic implementation)
const generateQRCodeSVG = (data: string): string => {
  // Create a simple QR-like pattern based on the data
  const size = 21; // Standard QR code is 21x21 modules
  const cellSize = 8;
  const totalSize = size * cellSize;

  // Generate a pseudo-random pattern based on the data
  let pattern = '';
  for (let i = 0; i < data.length; i++) {
    pattern += data.charCodeAt(i).toString(2).padStart(8, '0');
  }

  // Extend pattern to fill the grid
  while (pattern.length < size * size) {
    pattern += pattern;
  }
  pattern = pattern.substring(0, size * size);

  let svg = `<svg width="${totalSize}" height="${totalSize}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="white"/>`;

  // Add finder patterns (corners)
  const finderPattern = [
    [0, 0], [0, size-7], [size-7, 0]
  ];

  finderPattern.forEach(([x, y]) => {
    // Outer square
    svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="black"/>`;
    svg += `<rect x="${(x + 1) * cellSize}" y="${(y + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="white"/>`;
    svg += `<rect x="${(x + 2) * cellSize}" y="${(y + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="black"/>`;
  });

  // Add data pattern
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Skip finder patterns
      const isFinderArea = (
        (x < 9 && y < 9) ||
        (x < 9 && y >= size - 8) ||
        (x >= size - 8 && y < 9)
      );

      if (!isFinderArea && pattern[y * size + x] === '1') {
        svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }

  svg += '</svg>';
  return svg;
};

export default function VoucherRewards() {
  const [vouchers, setVouchers] = useState<Voucher[]>(SAMPLE_VOUCHERS);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Handle ESC key to close QR modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showQRCode) {
        handleCloseQR();
      }
    };

    if (showQRCode) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showQRCode]);

  // Mock user stats
  const userStats: UserStats = {
    totalBattleWins: 25,
    availableWins: 18, // Some wins already spent
    totalVouchersClaimed: 3,
    totalValueClaimed: 'RM33'
  };

  const handleVoucherClick = (voucherId: string) => {
    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher) return;

    // If already redeemed, do nothing
    if (voucher.isRedeemed) return;

    // Check if user has enough battle wins
    if (userStats.availableWins < voucher.battleWinsRequired) {
      alert('Not enough battle wins! Win more battles to claim this voucher.');
      return;
    }

    // Generate QR code data (in real app, this would be from backend)
    const qrData = `ECOMON_VOUCHER:${voucherId}:${Date.now()}`;

    // Show QR code immediately
    setShowQRCode(qrData);
    setSelectedVoucher(voucher);
  };

  const handleCloseQR = () => {
    if (selectedVoucher) {
      // Mark voucher as redeemed when QR is closed
      setVouchers(prev => prev.map(v =>
        v.id === selectedVoucher.id
          ? {
              ...v,
              isRedeemed: true,
              redeemedAt: new Date().toISOString(),
              qrCode: showQRCode || undefined
            }
          : v
      ));

      // Update user stats (in real app, this would be handled by backend)
      userStats.availableWins -= selectedVoucher.battleWinsRequired;
      userStats.totalVouchersClaimed += 1;
    }

    setShowQRCode(null);
    setSelectedVoucher(null);
  };

  const filteredVouchers = vouchers.filter(voucher => 
    filterCategory === 'all' || voucher.category === filterCategory
  );

  const getCategoryIcon = (category: string): string => {
    const icons = {
      food: '🍽️',
      shopping: '🛍️',
      entertainment: '🎭',
      eco: '🌿',
      transport: '🚗',
      all: '✨'
    };
    return icons[category as keyof typeof icons] || '🎁';
  };

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '100px',
      position: 'relative',
      background: 'transparent'
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
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        margin: '20px',
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
            🎁
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            color: 'white',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Voucher Rewards
          </h1>
        </div>
        <p style={{
          margin: 0,
          color: 'rgba(255,255,255,0.9)',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Trade your battle wins for amazing rewards!
        </p>
      </div>

      {/* User Stats */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255,255,255,0.2)',
        margin: '0 20px 20px 20px',
        padding: '20px',
        borderRadius: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          <div style={{
            textAlign: 'center',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '16px',
            padding: '16px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#4CAF50',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {userStats.availableWins}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: '600'
            }}>
              Available Wins
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '16px',
            padding: '16px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FF9800',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {userStats.totalVouchersClaimed}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: '600'
            }}>
              Vouchers Claimed
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{
        margin: '0 20px 20px 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '4px'
        }}>
          {['all', 'food', 'shopping', 'entertainment', 'eco', 'transport'].map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              style={{
                padding: '8px 16px',
                background: filterCategory === category 
                  ? 'linear-gradient(135deg, #FF6B35, #F7931E)'
                  : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                color: filterCategory === category ? 'white' : '#2E7D32',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                outline: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Vouchers List */}
      <div style={{
        margin: '0 20px',
        position: 'relative',
        zIndex: 1
      }}>
        {filteredVouchers.map((voucher) => {
          const canAfford = userStats.availableWins >= voucher.battleWinsRequired;

          return (
            <div
              key={voucher.id}
              style={{
                marginBottom: '16px',
                borderRadius: '20px',
                background: voucher.isRedeemed
                  ? 'rgba(128,128,128,0.3)'
                  : canAfford
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: voucher.isRedeemed
                  ? '2px solid rgba(128,128,128,0.5)'
                  : canAfford
                    ? '2px solid rgba(76,175,80,0.5)'
                    : '1px solid rgba(255,255,255,0.2)',
                cursor: voucher.isRedeemed ? 'not-allowed' : canAfford ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                opacity: voucher.isRedeemed ? 0.6 : 1
              }}
              onClick={() => handleVoucherClick(voucher.id)}
            >
              {/* Voucher Card */}
              <div
                style={{
                  background: voucher.isRedeemed
                    ? 'linear-gradient(135deg, #757575, #424242)'
                    : voucher.backgroundColor,
                  padding: '20px',
                  borderRadius: '18px',
                  color: voucher.textColor,
                  position: 'relative'
                }}
              >
                {/* Redeemed Overlay */}
                {voucher.isRedeemed && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-15deg)',
                    background: 'rgba(255,0,0,0.9)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: '2px solid white',
                    zIndex: 10
                  }}>
                    REDEEMED
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {voucher.brandLogo}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                      }}>
                        {voucher.brand}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        opacity: 0.9
                      }}>
                        {voucher.description}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    }}>
                      {voucher.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.8
                    }}>
                      {voucher.battleWinsRequired} wins
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  opacity: 0.8
                }}>
                  <div>
                    Expires: {new Date(voucher.expiryDate).toLocaleDateString()}
                  </div>
                  <div>
                    {voucher.isRedeemed ? (
                      <span style={{
                        background: 'rgba(255,0,0,0.8)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        🔒 REDEEMED
                      </span>
                    ) : canAfford ? (
                      <span style={{
                        background: 'rgba(76,175,80,0.8)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        👆 Click to redeem
                      </span>
                    ) : (
                      <span style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        Need {voucher.battleWinsRequired - userStats.availableWins} more wins
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Modal */}
      {showQRCode && selectedVoucher && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000, // Higher than navigation bar (1000)
            padding: '20px'
          }}
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              handleCloseQR();
            }
          }}
        >
          <div style={{
            background: '#2a2a2a',
            borderRadius: '20px',
            padding: '30px',
            textAlign: 'center',
            maxWidth: '350px',
            width: '100%',
            position: 'relative',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            {/* Voucher Info Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '32px',
                background: selectedVoucher.backgroundColor,
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selectedVoucher.brandLogo}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{
                  margin: '0 0 4px 0',
                  color: '#2E7D32',
                  fontSize: '20px'
                }}>
                  {selectedVoucher.brand}
                </h2>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#FF6B35'
                }}>
                  {selectedVoucher.title}
                </div>
              </div>
            </div>

            {/* QR Code Display */}
            <div style={{
              width: '200px',
              height: '200px',
              margin: '0 auto 20px auto',
              borderRadius: '12px',
              border: '3px solid #4CAF50',
              overflow: 'hidden',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(76,175,80,0.3)'
            }}>
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  background: `url("data:image/svg+xml,${encodeURIComponent(generateQRCodeSVG(showQRCode))}")`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
              />
            </div>

            {/* Instructions */}
            <div style={{
              background: 'rgba(76,175,80,0.1)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{
                margin: '0 0 8px 0',
                color: '#2E7D32',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                📱 Show this QR code to the merchant
              </p>
              <p style={{
                margin: 0,
                color: '#ccc',
                fontSize: '12px'
              }}>
                Valid until: {new Date(selectedVoucher.expiryDate).toLocaleDateString()}
              </p>
            </div>

            {/* Voucher Details */}
            <div style={{
              background: '#3a3a3a',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#ccc',
              textAlign: 'left'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Terms & Conditions:</div>
              <ul style={{ margin: 0, paddingLeft: '16px' }}>
                {selectedVoucher.termsAndConditions.map((term, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{term}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleCloseQR}
              style={{
                background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(76,175,80,0.3)'
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
              ✅ Redeemed & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
