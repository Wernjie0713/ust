import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import RecyclingCamera from '../components/ecomon/RecyclingCamera';

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
  };
}

export default function CameraPage() {
  const router = useRouter();
  const { binId } = router.query;
  const [showCamera, setShowCamera] = useState(true);

  const handleCapture = (result: CaptureResult) => {
    console.log('📸 Capture result:', result);

    // Store success information for notification
    if (result.success) {
      localStorage.setItem('ecomonMissionComplete', JSON.stringify({
        timestamp: Date.now(),
        rewards: result.rewards,
        ecoMon: result.ecoMon,
        aiAnalysis: result.aiAnalysis
      }));

      // Navigate back to map after successful capture
      console.log('🗺️ Navigating back to map after successful capture');
      setTimeout(() => {
        router.push('/');
      }, 500); // Small delay to ensure localStorage is set
    }
  };

  const handleClose = () => {
    setShowCamera(false);
    // Navigate back to map
    router.push('/');
  };

  if (!showCamera) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: `url('/bg.png') center center / cover no-repeat`,
        flexDirection: 'column',
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

        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            color: 'white',
            marginBottom: '20px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontSize: '24px'
          }}>📸 Camera Closed</h2>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
              transition: 'all 0.3s ease'
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
            🗺️ Back to Map
          </button>
        </div>
      </div>
    );
  }

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
        <title>EcoMon Camera - Capture Waste</title>
        <meta name="description" content="Capture waste items to earn rewards and generate EcoMons" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* Prevent video player behavior on mobile */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />

        {/* iOS specific meta tags */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-title" content="EcoMon Camera" />

        {/* Android specific meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="EcoMon Camera" />

        <style jsx global>{`
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden;
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            touch-action: manipulation !important;
          }
          body {
            background: url('/bg.png') center center / cover no-repeat !important;
          }

          /* Prevent video controls and PiP on all browsers */
          video {
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            -khtml-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            outline: none !important;
            pointer-events: none !important;
          }

          video::-webkit-media-controls {
            display: none !important;
            -webkit-appearance: none !important;
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

          /* Prevent fullscreen video */
          video::-webkit-full-page-media {
            display: none !important;
          }

          video::-webkit-media-controls-fullscreen-button {
            display: none !important;
          }
        `}</style>
      </Head>

      <RecyclingCamera
        binId={binId as string}
        onCapture={handleCapture}
        onClose={handleClose}
      />
    </div>
  );
}
