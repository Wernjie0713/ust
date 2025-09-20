import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface UserSubmission {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  binId: string;
  binLocation: string;
  wasteType: string;
  submissionTime: string;
  status: 'active' | 'guilty' | 'pending' | 'verified';
  confidence: number;
  fraudRisk: 'low' | 'medium' | 'high';
  previousViolations: number;
  ecoPoints: number;
  imageUrl?: string;
}

export default function RecyclerUsers() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'guilty' | 'active'>('all');
  
  const [users, setUsers] = useState<UserSubmission[]>([
    {
      id: '1',
      userId: 'user_001',
      userName: 'John Doe',
      userAvatar: '👤',
      binId: 'BIN_001',
      binLocation: 'KLCC Station',
      wasteType: 'plastic',
      submissionTime: '2024-07-19T10:30:00Z',
      status: 'active',
      confidence: 96.2,
      fraudRisk: 'low',
      previousViolations: 0,
      ecoPoints: 1250
    },
    {
      id: '2',
      userId: 'user_002',
      userName: 'Jane Smith',
      userAvatar: '👤',
      binId: 'BIN_003',
      binLocation: 'Pavilion Hub',
      wasteType: 'metal',
      submissionTime: '2024-07-19T10:15:00Z',
      status: 'active',
      confidence: 94.8,
      fraudRisk: 'low',
      previousViolations: 0,
      ecoPoints: 890
    },
    {
      id: '3',
      userId: 'user_003',
      userName: 'Bob Johnson',
      userAvatar: '👤',
      binId: 'BIN_002',
      binLocation: 'Bukit Bintang',
      wasteType: 'paper',
      submissionTime: '2024-07-19T09:45:00Z',
      status: 'pending',
      confidence: 78.3,
      fraudRisk: 'medium',
      previousViolations: 1,
      ecoPoints: 450
    },
    {
      id: '4',
      userId: 'user_004',
      userName: 'Alice Wong',
      userAvatar: '👤',
      binId: 'BIN_001',
      binLocation: 'KLCC Station',
      wasteType: 'plastic',
      submissionTime: '2024-07-19T09:30:00Z',
      status: 'guilty',
      confidence: 89.5,
      fraudRisk: 'high',
      previousViolations: 3,
      ecoPoints: 120
    }
  ]);

  const filteredUsers = users.filter(user => {
    if (selectedFilter === 'all') return true;
    return user.status === selectedFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'guilty': return '#F44336';
      case 'pending': return '#FF9800';
      case 'verified': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const handleStatusChange = (userId: string, newStatus: 'active' | 'guilty' | 'verified') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <title>User List - Recycler Dashboard</title>
        <meta name="description" content="Review user submissions and detect fraud" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style jsx global>{`
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden;
          }
        `}</style>
      </Head>

      <div style={{
        padding: '20px',
        paddingBottom: '100px',
        maxWidth: '800px',
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
            👥 User List
          </h1>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Review user submissions and manage fraud detection
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: 'All Users', count: users.length },
              { key: 'active', label: 'Active', count: users.filter(u => u.status === 'active').length },
              { key: 'pending', label: 'Pending', count: users.filter(u => u.status === 'pending').length },
              { key: 'guilty', label: 'Guilty', count: users.filter(u => u.status === 'guilty').length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key as 'all' | 'pending' | 'guilty' | 'active')}
                style={{
                  background: selectedFilter === filter.key 
                    ? 'rgba(255,255,255,0.3)' 
                    : 'rgba(255,255,255,0.1)',
                  border: selectedFilter === filter.key 
                    ? '1px solid rgba(255,255,255,0.5)' 
                    : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: selectedFilter === filter.key ? 'bold' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* User Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {filteredUsers.map(user => (
            <div
              key={user.id}
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {user.userAvatar}
                  </div>
                  <div>
                    <div style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {user.userName}
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '12px'
                    }}>
                      {user.ecoPoints} EcoPoints • {formatTime(user.submissionTime)}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: getStatusColor(user.status),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {user.status}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '8px',
                marginBottom: '12px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.9)'
              }}>
                <div><strong>Bin:</strong> {user.binId}</div>
                <div><strong>Location:</strong> {user.binLocation}</div>
                <div><strong>Type:</strong> {user.wasteType}</div>
                <div><strong>Confidence:</strong> {user.confidence}%</div>
                <div>
                  <strong>Risk:</strong> 
                  <span style={{ color: getRiskColor(user.fraudRisk), marginLeft: '4px' }}>
                    {user.fraudRisk.toUpperCase()}
                  </span>
                </div>
                <div><strong>Violations:</strong> {user.previousViolations}</div>
              </div>

              {user.status === 'pending' && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  <button
                    onClick={() => handleStatusChange(user.id, 'verified')}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(user.id, 'guilty')}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #F44336, #D32F2F)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🚨 Mark Guilty
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
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
          <span style={{ fontSize: '20px' }}>📸</span>
          Bin Scanner
        </button>

        <button
          onClick={() => router.push('/recycler/users')}
          style={{
            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
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
    </div>
  );
}
