import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface DashboardStats {
  totalBinsScanned: number;
  fraudDetected: number;
  usersVerified: number;
  todayCollections: number;
  pendingReviews: number;
  accuracyRate: number;
}

interface RecentActivity {
  id: string;
  type: 'scan' | 'fraud' | 'verification';
  user: string;
  binId: string;
  timestamp: string;
  status: 'approved' | 'rejected' | 'pending';
  confidence: number;
}

export default function RecyclerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalBinsScanned: 247,
    fraudDetected: 12,
    usersVerified: 156,
    todayCollections: 34,
    pendingReviews: 8,
    accuracyRate: 94.2
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'fraud',
      user: 'John Doe',
      binId: 'BIN_001',
      timestamp: '2024-07-19T10:30:00Z',
      status: 'rejected',
      confidence: 89.5
    },
    {
      id: '2',
      type: 'verification',
      user: 'Jane Smith',
      binId: 'BIN_003',
      timestamp: '2024-07-19T10:15:00Z',
      status: 'approved',
      confidence: 96.2
    },
    {
      id: '3',
      type: 'scan',
      user: 'Bob Johnson',
      binId: 'BIN_002',
      timestamp: '2024-07-19T09:45:00Z',
      status: 'pending',
      confidence: 78.3
    }
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'fraud': return '🚨';
      case 'verification': return '✅';
      case 'scan': return '📸';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <div style={{
      padding: '20px',
      paddingBottom: '100px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '32px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          letterSpacing: '2px'
        }}>
          RECYCLER ROUTINE
        </h1>
        <p style={{
          margin: 0,
          fontSize: '16px',
          color: 'rgba(255,255,255,0.9)',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Fraud Detection & Verification Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Today's Collections */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '32px' }}>🗂️</span>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>Today's Collections</h3>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#4CAF50',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {stats.todayCollections}
          </div>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            Bins processed today
          </p>
        </div>

        {/* Fraud Detection */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '32px' }}>🚨</span>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>Fraud Detected</h3>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#F44336',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {stats.fraudDetected}
          </div>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            Cases this week
          </p>
        </div>

        {/* Accuracy Rate */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '32px' }}>🎯</span>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>AI Accuracy</h3>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2196F3',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {stats.accuracyRate}%
          </div>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            Detection accuracy
          </p>
        </div>

        {/* Pending Reviews */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '32px' }}>⏳</span>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>Pending Reviews</h3>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#FF9800',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {stats.pendingReviews}
          </div>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)'
          }}>
            Awaiting verification
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <button
            onClick={() => router.push('/recycler/camera')}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(76,175,80,0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '20px' }}>📸</span>
            Scan Bin
          </button>

          <button
            onClick={() => router.push('/recycler/users')}
            style={{
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(33,150,243,0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '20px' }}>👥</span>
            Review Users
          </button>
        </div>
      </div>
    </div>
  );
}
