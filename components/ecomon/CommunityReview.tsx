'use client'

import React, { useState, useEffect } from 'react';
import { FaThumbsUp, FaThumbsDown, FaExclamationTriangle, FaUser, FaClock, FaComments } from 'react-icons/fa';

interface ReportedUser {
  id: string;
  username: string;
  avatar: string;
  reportReason: string;
  reportedBy: string;
  reportDate: string;
  evidence: string[];
  description: string;
  votes: {
    guilty: number;
    innocent: number;
    total: number;
  };
  userVote?: 'guilty' | 'innocent' | null;
  selfExplanation?: string;
  status: 'pending' | 'resolved' | 'escalated';
  severity: 'low' | 'medium' | 'high';
}

export default function CommunityReview() {
  const [reportedUsers, setReportedUsers] = useState<ReportedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ReportedUser | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');
  const [sortBy, setSortBy] = useState<'date' | 'votes' | 'severity'>('date');
  const [expandedBottles, setExpandedBottles] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockReports: ReportedUser[] = [
      {
        id: '1',
        username: 'EcoWarrior123',
        avatar: '🌱',
        reportReason: 'Suspicious plastic bottle submissions',
        reportedBy: 'Bayes Server AI',
        reportDate: '2024-01-15',
        evidence: ['/assets/images/bottle1.svg', '/assets/images/bottle2.svg'],
        description: 'User submitted multiple plastic bottles that appear to be the same items photographed from different angles',
        votes: { guilty: 12, innocent: 3, total: 15 },
        status: 'pending',
        severity: 'high',
        selfExplanation: 'I can explain that these photos were taken at different recycling centers during my weekly routine. I understand the confusion but I assure you all items were properly recycled.'
      },
      {
        id: '2',
        username: 'RecycleKing',
        avatar: '♻️',
        reportReason: 'Location spoofing',
        reportedBy: 'TruthSeeker',
        reportDate: '2024-01-14',
        evidence: ['/evidence3.jpg'],
        description: 'GPS data shows impossible travel times between recycling locations',
        votes: { guilty: 8, innocent: 7, total: 15 },
        status: 'pending',
        severity: 'medium'
      },
      {
        id: '3',
        username: 'GreenThumb',
        avatar: '🍃',
        reportReason: 'Duplicate submissions',
        reportedBy: 'EcoDetective',
        reportDate: '2024-01-13',
        evidence: ['/evidence4.jpg', '/evidence5.jpg'],
        description: 'Same items submitted multiple times for points',
        votes: { guilty: 5, innocent: 10, total: 15 },
        status: 'resolved',
        severity: 'low'
      }
    ];
    setReportedUsers(mockReports);
  }, []);

  const handleVote = (userId: string, vote: 'guilty' | 'innocent') => {
    setReportedUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newVotes = { ...user.votes };
        
        // Remove previous vote if exists
        if (user.userVote === 'guilty') newVotes.guilty--;
        if (user.userVote === 'innocent') newVotes.innocent--;
        
        // Add new vote
        if (vote === 'guilty') newVotes.guilty++;
        if (vote === 'innocent') newVotes.innocent++;
        
        return {
          ...user,
          votes: newVotes,
          userVote: vote
        };
      }
      return user;
    }));
  };

  const handleSelfExplanation = (userId: string) => {
    const user = reportedUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setExplanation(user.selfExplanation || '');
      setShowExplanationModal(true);
    }
  };

  const submitExplanation = () => {
    if (selectedUser) {
      setReportedUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, selfExplanation: explanation }
          : user
      ));
    }
    setShowExplanationModal(false);
    setExplanation('');
    setSelectedUser(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#ff4444';
      case 'medium': return '#ff8800';
      case 'low': return '#ffaa00';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff8800';
      case 'resolved': return '#44ff44';
      case 'escalated': return '#ff4444';
      default: return '#666';
    }
  };

  const filteredUsers = reportedUsers
    .filter(user => {
      if (filter === 'all') return true;
      return user.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime();
        case 'votes':
          return b.votes.total - a.votes.total;
        case 'severity':
          const severityOrder = { high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        default:
          return 0;
      }
    });

  return (
    <div style={{
      padding: '20px',
      paddingBottom: '120px',
      maxWidth: '800px',
      margin: '0 auto',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '28px',
          background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🏛️ Community Review
        </h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Help maintain fair play by reviewing reported users
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {['all', 'pending', 'resolved'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            style={{
              background: filter === filterType
                ? 'linear-gradient(135deg, #ff6b35, #f7931e)'
                : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '20px',
              padding: '10px 20px',
              color: 'white',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.3s ease'
            }}
          >
            {filterType} ({reportedUsers.filter(u => filterType === 'all' || u.status === filterType).length})
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <span style={{
          color: 'white',
          opacity: 0.8,
          alignSelf: 'center',
          fontSize: '14px'
        }}>
          Sort by:
        </span>
        {[
          { key: 'date', label: '📅 Date' },
          { key: 'votes', label: '🗳️ Votes' },
          { key: 'severity', label: '⚠️ Severity' }
        ].map(sortOption => (
          <button
            key={sortOption.key}
            onClick={() => setSortBy(sortOption.key as any)}
            style={{
              background: sortBy === sortOption.key
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '15px',
              padding: '5px 12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.3s ease'
            }}
          >
            {sortOption.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredUsers.map(user => (
          <div key={user.id} style={{
            background: 'rgba(0,0,0,0.8)',
            borderRadius: '15px',
            padding: '20px',
            border: `2px solid ${getSeverityColor(user.severity)}40`
          }}>
            {/* User Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '30px' }}>{user.avatar}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{user.username}</h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    fontSize: '12px',
                    opacity: 0.7,
                    marginTop: '5px'
                  }}>
                    <span><FaClock /> {user.reportDate}</span>
                    <span style={{ 
                      background: getSeverityColor(user.severity),
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      fontSize: '10px'
                    }}>
                      {user.severity}
                    </span>
                    <span style={{ 
                      background: getStatusColor(user.status),
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      fontSize: '10px'
                    }}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Details */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ 
                background: 'rgba(255,107,53,0.2)',
                padding: '10px',
                borderRadius: '10px',
                marginBottom: '10px'
              }}>
                <strong><FaExclamationTriangle /> Reported for:</strong> {user.reportReason}
              </div>
              <p style={{ margin: '10px 0', opacity: 0.9 }}>{user.description}</p>
              <small style={{ opacity: 0.7 }}>
                <FaUser /> Reported by: {user.reportedBy}
              </small>
            </div>

            {/* Self Explanation */}
            {user.selfExplanation && (
              <div style={{
                background: 'rgba(68,255,68,0.1)',
                border: '1px solid rgba(68,255,68,0.3)',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '15px'
              }}>
                <strong><FaComments /> User's Explanation:</strong>
                <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>
                  "{user.selfExplanation}"
                </p>
              </div>
            )}

            {/* Bottle Expansion Section - Only for first user */}
            {user.id === '1' && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <strong>🍶 Captured Bottles</strong>
                  <button
                    onClick={() => setExpandedBottles(!expandedBottles)}
                    style={{
                      background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                      border: 'none',
                      borderRadius: '15px',
                      padding: '5px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {expandedBottles ? 'Hide Details' : 'Show All (10)'}
                  </button>
                </div>

                {expandedBottles ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: '10px',
                    marginTop: '10px'
                  }}>
                    {/* Generate 10 bottles with enhanced lighting */}
                    {Array.from({ length: 10 }, (_, index) => (
                      <div key={index} style={{
                        position: 'relative',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '5px',
                        filter: 'brightness(1.3) contrast(1.1)',
                        boxShadow: '0 2px 8px rgba(255,255,255,0.2)'
                      }}>
                        <img
                          src={index % 2 === 0 ? '/assets/images/bottle1.svg' : '/assets/images/bottle2.svg'}
                          alt={`Bottle ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '60px',
                            objectFit: 'contain',
                            filter: 'brightness(1.2) saturate(1.1)'
                          }}
                        />
                        <div style={{
                          fontSize: '10px',
                          textAlign: 'center',
                          marginTop: '2px',
                          opacity: 0.8
                        }}>
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    {/* Show first 3 bottles as preview */}
                    {Array.from({ length: 3 }, (_, index) => (
                      <div key={index} style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '3px',
                        filter: 'brightness(1.3) contrast(1.1)',
                        boxShadow: '0 2px 8px rgba(255,255,255,0.2)'
                      }}>
                        <img
                          src={index % 2 === 0 ? '/assets/images/bottle1.svg' : '/assets/images/bottle2.svg'}
                          alt={`Bottle ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'brightness(1.2) saturate(1.1)'
                          }}
                        />
                      </div>
                    ))}
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      marginLeft: '5px'
                    }}>
                      +7 more bottles
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Voting Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleVote(user.id, 'innocent')}
                  disabled={user.status !== 'pending'}
                  style={{
                    background: user.userVote === 'innocent' 
                      ? 'linear-gradient(135deg, #44ff44, #22cc22)'
                      : 'rgba(68,255,68,0.2)',
                    border: '1px solid rgba(68,255,68,0.5)',
                    borderRadius: '25px',
                    padding: '8px 15px',
                    color: 'white',
                    cursor: user.status === 'pending' ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    opacity: user.status !== 'pending' ? 0.5 : 1
                  }}
                >
                  <FaThumbsUp /> Innocent ({user.votes.innocent})
                </button>
                
                <button
                  onClick={() => handleVote(user.id, 'guilty')}
                  disabled={user.status !== 'pending'}
                  style={{
                    background: user.userVote === 'guilty' 
                      ? 'linear-gradient(135deg, #ff4444, #cc2222)'
                      : 'rgba(255,68,68,0.2)',
                    border: '1px solid rgba(255,68,68,0.5)',
                    borderRadius: '25px',
                    padding: '8px 15px',
                    color: 'white',
                    cursor: user.status === 'pending' ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    opacity: user.status !== 'pending' ? 0.5 : 1
                  }}
                >
                  <FaThumbsDown /> Guilty ({user.votes.guilty})
                </button>
              </div>

              <button
                onClick={() => handleSelfExplanation(user.id)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  padding: '8px 15px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {user.selfExplanation ? 'View/Edit Explanation' : 'Add Explanation'}
              </button>
            </div>

            {/* Vote Progress */}
            <div style={{ marginTop: '15px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                height: '10px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {/* Innocent votes (left side - green) */}
                <div style={{
                  background: 'linear-gradient(90deg, #44ff44, #22cc22)',
                  height: '100%',
                  width: `${user.votes.total > 0 ? (user.votes.innocent / user.votes.total) * 100 : 0}%`,
                  transition: 'width 0.3s ease',
                  position: 'absolute',
                  left: 0
                }} />
                {/* Guilty votes (right side - red) */}
                <div style={{
                  background: 'linear-gradient(90deg, #ff4444, #cc2222)',
                  height: '100%',
                  width: `${user.votes.total > 0 ? (user.votes.guilty / user.votes.total) * 100 : 0}%`,
                  transition: 'width 0.3s ease',
                  position: 'absolute',
                  right: 0
                }} />
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginTop: '5px',
                opacity: 0.7
              }}>
                <span style={{ color: '#44ff44' }}>✓ Innocent: {user.votes.innocent}</span>
                <span>Total: {user.votes.total}</span>
                <span style={{ color: '#ff4444' }}>✗ Guilty: {user.votes.guilty}</span>
              </div>
              {/* Verdict indicator */}
              {user.votes.total >= 10 && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '8px',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: user.votes.innocent > user.votes.guilty
                    ? 'rgba(68,255,68,0.2)'
                    : 'rgba(255,68,68,0.2)',
                  color: user.votes.innocent > user.votes.guilty ? '#44ff44' : '#ff4444',
                  border: `1px solid ${user.votes.innocent > user.votes.guilty ? '#44ff44' : '#ff4444'}40`
                }}>
                  {user.votes.innocent > user.votes.guilty
                    ? '✓ Community Verdict: INNOCENT'
                    : '✗ Community Verdict: GUILTY'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Self Explanation Modal */}
      {showExplanationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.95)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0',
              textAlign: 'center',
              color: 'white'
            }}>
              Explain Your Side
            </h3>
            <p style={{ 
              margin: '0 0 15px 0',
              opacity: 0.8,
              fontSize: '14px'
            }}>
              Provide your explanation for the reported behavior. This will be visible to all reviewers.
            </p>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Type your explanation here..."
              style={{
                width: '100%',
                height: '120px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '15px',
                color: 'white',
                fontSize: '14px',
                resize: 'vertical',
                marginBottom: '20px'
              }}
            />
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowExplanationModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  padding: '10px 20px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitExplanation}
                style={{
                  background: 'linear-gradient(135deg, #44ff44, #22cc22)',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 20px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Submit Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
