import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import BottomNavigation from '../../components/navigation/BottomNavigation';

interface ScanResult {
  binId: string;
  binLocation: string;
  capacity: number;
  currentLevel: number;
  lastEmptied: string;
  wasteTypes: string[];
  fraudDetected: boolean;
  confidence: number;
  userSubmissions: number;
}

export default function RecyclerCamera() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const scanBin = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);

    // Simulate scanning process
    setTimeout(() => {
      // Mock scan result
      const mockResult: ScanResult = {
        binId: 'BIN_' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        binLocation: 'KLCC Recycling Station',
        capacity: 100,
        currentLevel: Math.floor(Math.random() * 100),
        lastEmptied: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        wasteTypes: ['plastic', 'metal', 'paper'],
        fraudDetected: Math.random() > 0.8,
        confidence: Math.floor(Math.random() * 30) + 70,
        userSubmissions: Math.floor(Math.random() * 20) + 5
      };

      setScanResult(mockResult);
      setIsScanning(false);
    }, 3000);
  };

  const resetScan = () => {
    setScanResult(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `url('/bg.png') center center / cover no-repeat`,
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto'
    }}>
      <Head>
        <title>Recycler Bin Scanner - EcoMon</title>
        <meta name="description" content="Scan recycling bins to verify user submissions and detect fraud" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

      </Head>

      <div style={{
        padding: '20px',
        paddingBottom: '100px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            📸 Bin Scanner
          </h1>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Scan recycling bins to verify contents and detect fraud
          </p>
        </div>

        {/* Camera View */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          position: 'relative'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '300px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#000'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />

            {/* Scanning Overlay */}
            {isScanning && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div className="spinner" style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(76,175,80,0.3)',
                  borderTop: '4px solid #4CAF50',
                  borderRadius: '50%'
                }} />
                <div style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  Scanning Bin...
                </div>
              </div>
            )}

            {/* Scan Frame */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              border: '3px solid #4CAF50',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(76,175,80,0.5)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Scan Button */}
          <button
            onClick={scanBin}
            disabled={isScanning || !cameraActive}
            style={{
              width: '100%',
              background: isScanning ? '#9E9E9E' : 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(76,175,80,0.3)',
              marginTop: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            {isScanning ? 'Scanning...' : '📸 Scan Bin'}
          </button>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {scanResult.fraudDetected ? '🚨' : '✅'} Scan Results
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <div style={{
                background: scanResult.fraudDetected ? 'rgba(244,67,54,0.2)' : 'rgba(76,175,80,0.2)',
                border: `1px solid ${scanResult.fraudDetected ? '#F44336' : '#4CAF50'}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  color: scanResult.fraudDetected ? '#F44336' : '#4CAF50',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {scanResult.fraudDetected ? 'FRAUD DETECTED' : 'VERIFIED CLEAN'}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  marginTop: '4px'
                }}>
                  Confidence: {scanResult.confidence}%
                </div>
              </div>

              <div style={{ color: 'white', fontSize: '14px', lineHeight: '1.6' }}>
                <div><strong>Bin ID:</strong> {scanResult.binId}</div>
                <div><strong>Location:</strong> {scanResult.binLocation}</div>
                <div><strong>Capacity:</strong> {scanResult.currentLevel}/{scanResult.capacity} ({Math.round((scanResult.currentLevel/scanResult.capacity)*100)}%)</div>
                <div><strong>User Submissions:</strong> {scanResult.userSubmissions}</div>
                <div><strong>Waste Types:</strong> {scanResult.wasteTypes.join(', ')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => router.push('/recycler/users')}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                👥 Review Users
              </button>
              <button
                onClick={resetScan}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🔄 Scan Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(15px)',
        borderTop: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
        zIndex: 100
      }}>
        <button
          onClick={() => router.push('/recycler')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '10px',
            fontWeight: '500',
            padding: '6px',
            borderRadius: '12px'
          }}
        >
          <span style={{ fontSize: '20px' }}>🏠</span>
          Dashboard
        </button>

        <button
          onClick={() => router.push('/recycler/camera')}
          style={{
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '6px 8px',
            borderRadius: '12px'
          }}
        >
          <span style={{ fontSize: '20px' }}>📸</span>
          Bin Scanner
        </button>

        <button
          onClick={() => router.push('/recycler/users')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '10px',
            fontWeight: '500',
            padding: '6px',
            borderRadius: '12px'
          }}
        >
          <span style={{ fontSize: '20px' }}>👥</span>
          User List
        </button>

        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '10px',
            fontWeight: '500',
            padding: '6px',
            borderRadius: '12px'
          }}
        >
          <span style={{ fontSize: '20px' }}>🔙</span>
          Exit
        </button>
      </div>

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
