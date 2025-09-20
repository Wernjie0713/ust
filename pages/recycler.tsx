import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import RecyclerDashboard from '../components/recycler/RecyclerDashboard';
import BottomNavigation from '../components/navigation/BottomNavigation';

export default function RecyclerPage() {
  const router = useRouter();

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
        <title>EcoMon Recycler Dashboard - Fraud Detection & Verification</title>
        <meta name="description" content="Recycler dashboard for verifying user submissions and detecting fraud" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style jsx global>{`
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden;
          }
          body {
            background: url('/bg.png') center center / cover no-repeat !important;
          }
        `}</style>
      </Head>
      
      <RecyclerDashboard />

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
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
      }}>
        <button
          onClick={() => router.push('/recycler')}
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
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{ fontSize: '20px' }}>🏠</span>
          Dashboard
        </button>

        <button
          onClick={() => router.push('/recycler/camera')}
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
            transition: 'all 0.3s ease',
            padding: '6px',
            borderRadius: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
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
            transition: 'all 0.3s ease',
            padding: '6px',
            borderRadius: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
          }}
        >
          <span style={{ fontSize: '20px' }}>👥</span>
          User List
        </button>

        <button
          onClick={() => router.push('/recycler/analytics')}
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
            transition: 'all 0.3s ease',
            padding: '6px',
            borderRadius: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
          }}
        >
          <span style={{ fontSize: '20px' }}>📊</span>
          Analytics
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
            transition: 'all 0.3s ease',
            padding: '6px',
            borderRadius: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
          }}
        >
          <span style={{ fontSize: '20px' }}>🔙</span>
          Exit
        </button>
      </div>
    </div>
  );
}
