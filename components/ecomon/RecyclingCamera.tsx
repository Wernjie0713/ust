'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from '../../utils/auth';

// EcoMon Recycling Camera - Pokémon GO Style Capture Experience

interface CameraProps {
  binId?: string;
  onCapture?: (result: CaptureResult) => void;
  onClose?: () => void;
}

interface CaptureResult {
  success: boolean;
  actionId?: string;
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
    weightFormatted?: string;
    weightCategory?: string;
  };
}

interface CameraState {
  isActive: boolean;
  isCapturing: boolean;
  isAnalyzing: boolean;
  hasPermission: boolean;
  error: string | null;
}

export default function RecyclingCamera({ binId, onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    isCapturing: false,
    isAnalyzing: false,
    hasPermission: false,
    error: null
  });

  // Dustbin location state
  const [nearestDustbin, setNearestDustbin] = useState({
    type: 'General Waste',
    distance: '50m',
    direction: 'Northeast'
  });

  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(null);
  const [targetingMode, setTargetingMode] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<'idle' | 'scanning' | 'processing' | 'complete'>('idle');
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false);


  // Initialize camera
  useEffect(() => {
    initializeCamera();

    // Add resize listener for orientation changes
    window.addEventListener('resize', adjustVideoScale);
    window.addEventListener('orientationchange', () => {
      setTimeout(adjustVideoScale, 100); // Delay to ensure orientation change is complete
    });

    return () => {
      cleanup();
      window.removeEventListener('resize', adjustVideoScale);
      window.removeEventListener('orientationchange', adjustVideoScale);
    };
  }, []);

  const initializeCamera = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        // Add event listener to adjust video scale when metadata loads
        videoRef.current.addEventListener('loadedmetadata', adjustVideoScale);

        setCameraState(prev => ({
          ...prev,
          isActive: true,
          hasPermission: true,
          error: null
        }));
      }
    } catch (error: any) {
      console.error('Camera initialization error:', error);
      setCameraState(prev => ({
        ...prev,
        error: 'Camera access denied. Please enable camera permissions.',
        hasPermission: false
      }));
    }
  };

  // Adjust video scale to fill viewport completely
  const adjustVideoScale = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Reset any previous transforms
    video.style.transform = 'none';

    // Use CSS object-fit: cover to handle scaling automatically
    // This is more reliable than manual scaling calculations
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.objectPosition = 'center';
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Remove event listener
    if (videoRef.current) {
      videoRef.current.removeEventListener('loadedmetadata', adjustVideoScale);
    }
  };

  // Get nearest dustbin information (mock data for now)
  const getNearestDustbin = () => {
    // In a real app, this would use GPS and dustbin database
    const dustbins = [
      { type: 'General Waste', distance: '50m', direction: 'Northeast', color: '#666' },
      { type: 'Recycling', distance: '75m', direction: 'South', color: '#4CAF50' },
      { type: 'Organic Waste', distance: '120m', direction: 'West', color: '#8BC34A' }
    ];
    return dustbins[0]; // Return closest one
  };

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || cameraState.isCapturing) return;

    setCameraState(prev => ({ ...prev, isCapturing: true }));
    setTargetingMode(true);

    try {
      // Start scanning animation and capture immediately
      setAnalysisStage('scanning');

      // Capture frame from video immediately
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        // Brief scanning animation (500ms) then start processing
        setTimeout(() => {
          setAnalysisStage('processing');
        }, 500);

        // Convert to blob and start processing
        canvas.toBlob(async (blob) => {
          if (blob) {
            await processCapture(blob);
          }
        }, 'image/jpeg', 0.8);
      }
    } catch (error) {
      console.error('Capture error:', error);
      setCameraState(prev => ({
        ...prev,
        isCapturing: false,
        error: 'Failed to capture photo'
      }));
      setAnalysisStage('idle');
    }

    setTargetingMode(false);
  }, [cameraState.isCapturing]);

  // Process captured image with timeout and fallback
  const processCapture = async (imageBlob: Blob) => {
    setCameraState(prev => ({ ...prev, isAnalyzing: true }));

    // Create a timeout promise that resolves after 20 seconds with fallback data
    const timeoutPromise = new Promise<CaptureResult>((resolve) => {
      setTimeout(() => {
        console.log('AI analysis timeout - using fallback values');
        resolve({
          success: true,
          actionId: `fallback_${Date.now()}`,
          rewards: {
            ecoPoints: 75, // Fixed fallback values
            ecoTokens: 8
          },
          ecoMon: Math.random() < 0.2 ? {
            ecoMonId: `ecomon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'RecycleBot',
            rarity: 'common'
          } : undefined,
          aiAnalysis: {
            confidence: 85,
            wasteType: 'plastic',
            estimatedWeight: 250,
            weightFormatted: '250.0 grams',
            weightCategory: 'Medium'
          }
        });
      }, 300000); // Increased from 5 seconds to 20 seconds
    });

    // Create the main processing promise using our AI analysis API
    const processingPromise = new Promise<CaptureResult>((resolve, reject) => {
      try {
        // Create FormData to send image to API
        const formData = new FormData();
        formData.append('image', imageBlob, 'captured_image.jpg');

        // Call our AI analysis API
        fetch('/api/analyze-rubbish', {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }
          return response.json();
        })
        .then(analysisResult => {
          console.log('✅ AI Analysis Result:', analysisResult);

          if (analysisResult.success) {
            // Calculate rewards based on waste type and weight
            const basePoints = 50;
            const weightMultiplier = Math.max(1, Math.floor(analysisResult.weightGrams / 100));
            const categoryMultiplier = analysisResult.category === 'plastic' ? 1.2 : 
                                     analysisResult.category === 'metal' ? 1.5 :
                                     analysisResult.category === 'glass' ? 1.3 : 1.0;
            
            const ecoPoints = Math.floor(basePoints * weightMultiplier * categoryMultiplier);
            const ecoTokens = Math.floor(ecoPoints / 10) + Math.floor(Math.random() * 5) + 3;

            // Determine if EcoMon is captured (higher chance for rarer materials)
            const ecoMonChance = analysisResult.category === 'battery' ? 0.4 :
                                 analysisResult.category === 'metal' ? 0.3 :
                                 analysisResult.category === 'glass' ? 0.25 : 0.15;
            
            const captureResult: CaptureResult = {
              success: true,
              actionId: `ai_${Date.now()}`,
              rewards: {
                ecoPoints,
                ecoTokens
              },
              ecoMon: Math.random() < ecoMonChance ? {
                ecoMonId: `ecomon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: `${analysisResult.category.charAt(0).toUpperCase() + analysisResult.category.slice(1)}Mon`,
                rarity: analysisResult.weightGrams > 500 ? 'rare' : 
                       analysisResult.weightGrams > 200 ? 'uncommon' : 'common'
              } : undefined,
              aiAnalysis: {
                confidence: Math.floor(analysisResult.categoryConfidence * 100),
                wasteType: analysisResult.category,
                estimatedWeight: Math.floor(analysisResult.weightGrams),
                weightFormatted: analysisResult.weightFormatted,
                weightCategory: analysisResult.weightCategory
              }
            };

            resolve(captureResult);
          } else {
            throw new Error(analysisResult.error || 'Analysis failed');
          }
        })
        .catch(error => {
          console.error('AI analysis error:', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });

    try {
      // Race between processing and timeout
      const result = await Promise.race([processingPromise, timeoutPromise]);

      // Let the animation run for 5 seconds total before showing success
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Set result to show analysis
      setCaptureResult(result);
      setAnalysisStage('complete');

      // Show analysis results briefly (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Show upgrade animation if EcoMon was generated (briefly)
      if (result.ecoMon) {
        setShowUpgradeAnimation(true);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Show upgrade animation for 2 seconds
        setShowUpgradeAnimation(false);
      }

      // Skip the "Recycling Successful" page and go directly to next action
      setTimeout(() => {
        if (onCapture) {
          onCapture(result);
        }
      }, 500); // Brief delay to let any animations finish

    } catch (error: any) {
      console.error('Processing error:', error);

      // Even if there's an error, provide fallback result to continue flow
      const fallbackResult: CaptureResult = {
        success: true,
        actionId: `error_fallback_${Date.now()}`,
        rewards: {
          ecoPoints: 50, // Reduced rewards for error case
          ecoTokens: 5
        },
        ecoMon: undefined, // No EcoMon for error case
        aiAnalysis: {
          confidence: 60,
          wasteType: 'unknown',
          estimatedWeight: 200,
          weightFormatted: '200.0 grams',
          weightCategory: 'Medium'
        }
      };

      setCaptureResult(fallbackResult);

      // Skip the "Recycling Successful" page and go directly to next action
      setTimeout(() => {
        if (onCapture) {
          onCapture(fallbackResult);
        }
      }, 1000);

    } finally {
      setCameraState(prev => ({
        ...prev,
        isCapturing: false,
        isAnalyzing: false
      }));
      setAnalysisStage('idle');
    }
  };

  // Render upgrade animation
  if (showUpgradeAnimation && captureResult?.ecoMon) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        {/* Upgrade Animation */}
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '150px',
            marginBottom: '24px',
            animation: 'upgradeGlow 2s ease-in-out infinite'
          }}>
            🐉
          </div>
          <h1 style={{
            fontSize: '48px',
            marginBottom: '16px',
            color: '#FFD700',
            textShadow: '0 0 30px rgba(255,215,0,0.8)',
            animation: 'textGlow 2s ease-in-out infinite'
          }}>
            NEW ECOMON!
          </h1>
          <div style={{
            fontSize: '24px',
            color: '#4CAF50',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '3px'
          }}>
            {captureResult.ecoMon.type}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#FF6B6B',
            marginTop: '8px',
            textTransform: 'capitalize'
          }}>
            {captureResult.ecoMon.rarity} Rarity
          </div>
        </div>
      </div>
    );
  }



  // Render success screen
  if (captureResult && captureResult.success) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `url('/bg.png') center center / cover no-repeat`,
        overflowY: 'auto',
        zIndex: 9999,
        color: 'white',
        textAlign: 'center',
        padding: '20px 20px 120px 20px', // Extra bottom padding for safe area
        minHeight: '100vh',
        boxSizing: 'border-box'
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

        {/* Content Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minHeight: 'calc(100vh - 140px)', // Account for padding
          paddingTop: '40px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Main Success Container */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '32px 24px',
            position: 'relative',
            zIndex: 1,
            maxWidth: '400px',
            width: '100%',
            marginBottom: '20px'
          }}>
          {/* Monster Transition Animation */}
          <div style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            marginBottom: '24px',
            margin: '0 auto 24px auto'
          }}>
            <img
              src="/assets/noob.jpg"
              alt="Noob Monster"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                animation: 'fadeOutTransition 3s ease-in-out',
                border: '3px solid rgba(255,255,255,0.3)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            />
            <img
              src="/assets/geng.jpeg"
              alt="Geng Monster"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                animation: 'fadeInTransition 3s ease-in-out',
                border: '3px solid rgba(76,175,80,0.6)',
                boxShadow: '0 4px 15px rgba(76,175,80,0.4)'
              }}
            />
          </div>

          <h1 style={{
            fontSize: '32px',
            marginBottom: '16px',
            color: '#4CAF50',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontWeight: 'bold'
          }}>
            Recycling Successful!
          </h1>

          {/* Rewards */}
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              marginBottom: '16px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>Rewards Earned:</h3>
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              color: 'white',
              fontWeight: '600'
            }}>
              🏆 {captureResult.rewards?.ecoPoints} EcoPoints
            </div>
            <div style={{
              fontSize: '18px',
              marginBottom: '16px',
              color: 'white',
              fontWeight: '600'
            }}>
              🪙 {captureResult.rewards?.ecoTokens} EcoTokens
            </div>

            {/* AI Analysis */}
            {captureResult.aiAnalysis && (
              <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.9)',
                background: 'rgba(255,255,255,0.15)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)',
                marginBottom: '8px'
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: '#4CAF50'
                }}>
                  🤖 AI Analysis Results
                </div>
                <div style={{ marginBottom: '4px' }}>
                  🏷️ <strong>Category:</strong> {captureResult.aiAnalysis.wasteType.charAt(0).toUpperCase() + captureResult.aiAnalysis.wasteType.slice(1)}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  ⚖️ <strong>Weight:</strong> {captureResult.aiAnalysis.weightFormatted || `${captureResult.aiAnalysis.estimatedWeight}g`}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  📊 <strong>Category:</strong> {captureResult.aiAnalysis.weightCategory || 'Unknown'}
                </div>
                <div>
                  🎯 <strong>Confidence:</strong> {captureResult.aiAnalysis.confidence}%
                </div>
              </div>
            )}
          </div>

          {/* EcoMon Generation */}
          {captureResult.ecoMon && (
            <div style={{
              background: 'rgba(255,107,107,0.2)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,107,107,0.5)',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '24px',
              animation: 'glow 2s infinite',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '12px',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}>🐉</div>
              <h3 style={{
                marginBottom: '8px',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>New EcoMon Generated!</h3>
              <div style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '600'
              }}>
                {captureResult.ecoMon.type} - {captureResult.ecoMon.rarity}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '25px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: '280px',
              marginTop: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(76,175,80,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(76,175,80,0.3)';
            }}
          >
            🎮 Continue Recycling
          </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-30px); }
            60% { transform: translateY(-15px); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(255,107,107,0.5); }
            50% { box-shadow: 0 0 40px rgba(78,205,196,0.8); }
          }
          @keyframes fadeOutTransition {
            0% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
              filter: brightness(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.1) rotate(180deg);
              filter: brightness(1.2);
            }
            100% {
              opacity: 0;
              transform: scale(0.8) rotate(360deg);
              filter: brightness(0.5);
            }
          }
          @keyframes fadeInTransition {
            0% {
              opacity: 0;
              transform: scale(0.8) rotate(-360deg);
              filter: brightness(0.5);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.1) rotate(-180deg);
              filter: brightness(1.2);
            }
            100% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
              filter: brightness(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      zIndex: 9999,
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        loop
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5-page"
        x5-video-player-fullscreen="false"
        x5-video-orientation="portrait"
        preload="metadata"
        tabIndex={-1}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          pointerEvents: 'none',
          outline: 'none',
          border: 'none',
          background: '#000',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1, // Lower z-index than overlays
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      />

      {/* Video Interaction Blocker */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2, // Above video but below UI
        pointerEvents: 'auto',
        background: 'transparent',
        touchAction: 'none'
      }}
      onTouchStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      />

      {/* Hidden canvas for capture */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Camera UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10 // Higher than video
      }}>
        {/* Top Bar */}
        <div style={{
          position: 'absolute',
          top: 'max(20px, env(safe-area-inset-top))',
          left: 'max(20px, env(safe-area-inset-left))',
          right: 'max(20px, env(safe-area-inset-right))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'auto',
          paddingTop: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
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
            ✕
          </button>



          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            📸 Take a photo to recycle waste
          </div>
        </div>

        {/* Targeting Reticle */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          border: targetingMode ? '4px solid #4CAF50' : '2px solid rgba(255,255,255,0.5)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: targetingMode ? 'pulse 0.5s infinite' : 'none'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: targetingMode ? '#4CAF50' : 'rgba(255,255,255,0.8)',
            borderRadius: '50%'
          }} />
        </div>

        {/* Analysis Animation */}
        {analysisStage !== 'idle' && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            textShadow: '0 0 20px rgba(0,0,0,0.8)',
            zIndex: 20,
            pointerEvents: 'none'
          }}>

            {analysisStage === 'scanning' && (
              <div style={{
                fontSize: '80px',
                animation: 'scanPulse 1.5s ease-in-out infinite'
              }}>
                🔍
              </div>
            )}
            {analysisStage === 'processing' && (
              <div style={{
                fontSize: '80px',
                animation: 'processingRotate 2s linear infinite'
              }}>
                🤖
              </div>
            )}
          </div>
        )}

        {/* Dustbin Location Indicator - Floating above capture button */}
        <div style={{
          position: 'absolute',
          bottom: 'max(140px, calc(env(safe-area-inset-bottom) + 120px))',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '16px',
          padding: '12px 16px',
          color: 'white',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
          zIndex: 15
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#4CAF50',
            boxShadow: '0 0 8px rgba(76,175,80,0.6)'
          }}></div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>
              Nearest Dustbin
            </div>
            <div style={{ opacity: 0.9, fontSize: '11px' }}>
              {getNearestDustbin().type} • {getNearestDustbin().distance} {getNearestDustbin().direction}
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div style={{
          position: 'absolute',
          bottom: 'max(40px, env(safe-area-inset-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
          paddingBottom: '20px'
        }}>
          <button
            onClick={capturePhoto}
            disabled={cameraState.isCapturing || cameraState.isAnalyzing || !cameraState.hasPermission}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '4px solid rgba(255,255,255,0.8)',
              background: cameraState.isCapturing
                ? 'linear-gradient(135deg, #FF9800, #F57C00)'
                : 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              cursor: cameraState.isCapturing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              if (!cameraState.isCapturing && !cameraState.isAnalyzing && cameraState.hasPermission) {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(76,175,80,0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
            }}
          >
            {cameraState.isAnalyzing ? '🔄' : cameraState.isCapturing ? '⏱️' : '📸'}
          </button>
        </div>

        {/* Status Messages */}
        {cameraState.error && (
          <div style={{
            position: 'absolute',
            bottom: 'max(160px, calc(env(safe-area-inset-bottom) + 140px))',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(244,67,54,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(244,67,54,0.3)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '25px',
            fontSize: '14px',
            textAlign: 'center',
            maxWidth: '300px',
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            boxShadow: '0 4px 15px rgba(244,67,54,0.2)'
          }}>
            ⚠️ {cameraState.error}
          </div>
        )}


      </div>

      <style jsx>{`
        /* Prevent video player behavior on mobile */
        video::-webkit-media-controls {
          display: none !important;
        }
        video::-webkit-media-controls-panel {
          display: none !important;
        }
        video::-webkit-media-controls-play-button {
          display: none !important;
        }
        video::-webkit-media-controls-start-playback-button {
          display: none !important;
        }
        video::-webkit-full-page-media {
          display: none !important;
        }
        video::-webkit-media-controls-fullscreen-button {
          display: none !important;
        }
        video::-webkit-media-controls-timeline {
          display: none !important;
        }
        video::-webkit-media-controls-current-time-display {
          display: none !important;
        }
        video::-webkit-media-controls-time-remaining-display {
          display: none !important;
        }
        video::-webkit-media-controls-mute-button {
          display: none !important;
        }
        video::-webkit-media-controls-volume-slider {
          display: none !important;
        }
        video::-webkit-media-controls-seek-back-button {
          display: none !important;
        }
        video::-webkit-media-controls-seek-forward-button {
          display: none !important;
        }
        video::-webkit-media-controls-rewind-button {
          display: none !important;
        }
        video::-webkit-media-controls-return-to-realtime-button {
          display: none !important;
        }
        video::-webkit-media-controls-toggle-closed-captions-button {
          display: none !important;
        }

        /* Prevent context menu and selection */
        video {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
          outline: none !important;
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes scanPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes processingRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes completeBounce {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes upgradeGlow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 20px rgba(255,215,0,0.5));
          }
          50% {
            transform: scale(1.1);
            filter: drop-shadow(0 0 40px rgba(255,215,0,0.8));
          }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 30px rgba(255,215,0,0.8); }
          50% { text-shadow: 0 0 50px rgba(255,215,0,1); }
        }
        @keyframes diamondShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-3px) rotate(-2deg); }
          50% { transform: translateX(3px) rotate(2deg); }
          75% { transform: translateX(-2px) rotate(-1deg); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes textPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
