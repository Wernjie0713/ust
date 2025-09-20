'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

interface BottomNavigationProps {
  currentPage?: string;
}

// Navigation height constant for CSS custom property
export const NAV_HEIGHT = 72; // px

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    {
      id: 'recycle',
      icon: '♻️',
      label: 'Recycle',
      route: '/',
      gradient: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
      shadowColor: 'rgba(76,175,80,0.4)',
      shadowColorHover: 'rgba(76,175,80,0.6)',
      size: '42px',
      fontSize: '16px'
    },
    {
      id: 'game',
      icon: '🎮',
      label: 'Game',
      route: '/game',
      gradient: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
      shadowColor: 'rgba(76,175,80,0.4)',
      shadowColorHover: 'rgba(76,175,80,0.6)',
      size: '42px', // Mobile-friendly size
      fontSize: '16px'
    },
    {
      id: 'achievements',
      icon: '🏆',
      label: 'Awards',
      route: '/achievements',
      gradient: 'linear-gradient(135deg, #FF9800, #F57C00)',
      shadowColor: 'rgba(255,152,0,0.4)',
      shadowColorHover: 'rgba(255,152,0,0.6)',
      size: '42px',
      fontSize: '16px'
    },
    {
      id: 'vouchers',
      icon: '🎁',
      label: 'Vouchers',
      route: '/vouchers',
      gradient: 'linear-gradient(135deg, #E91E63, #AD1457)',
      shadowColor: 'rgba(233,30,99,0.4)',
      shadowColorHover: 'rgba(233,30,99,0.6)',
      size: '42px',
      fontSize: '16px'
    },
    {
      id: 'review',
      icon: '🏛️',
      label: 'Review',
      route: '/review',
      gradient: 'linear-gradient(135deg, #FF6B35, #F7931E)',
      shadowColor: 'rgba(255,107,53,0.4)',
      shadowColorHover: 'rgba(255,107,53,0.6)',
      size: '42px',
      fontSize: '16px'
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Profile',
      route: '/profile',
      gradient: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
      shadowColor: 'rgba(156,39,176,0.4)',
      shadowColorHover: 'rgba(156,39,176,0.6)',
      size: '42px',
      fontSize: '16px'
    }
  ];

  const handleNavigation = (route: string) => {
    if (route === '/') {
      // Navigate to main map/home page
      router.push('/');
    } else {
      router.push(route);
    }
  };

  // Single row layout since we have 6 items now
  const allItems = navigationItems; // All 6 items in one row

  // Handle drag to collapse
  const handleMouseDown = (e: React.MouseEvent) => {
    // Always prevent propagation when touching navigation area
    e.preventDefault();
    e.stopPropagation();

    // Only allow dragging on the navigation area, not on buttons
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return; // Don't start drag if clicking on a button
    }

    console.log('Mouse down, starting drag at:', { x: e.clientX, y: e.clientY });
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  // Use useEffect to add global mouse event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = e.clientY - dragStart.y;
      const deltaX = e.clientX - dragStart.x;

      // Update drag offset for visual feedback (limit the movement)
      const clampedY = Math.max(0, Math.min(deltaY, 100)); // Limit downward movement
      const clampedX = Math.max(-50, Math.min(deltaX, 50)); // Limit horizontal movement
      setDragOffset({ x: clampedX, y: clampedY });

      console.log('Dragging:', { deltaY, deltaX, clampedY, isDragging });

      // If dragged down significantly (very sensitive threshold)
      if (deltaY > 20) {
        console.log('Collapsing navigation!');
        setIsCollapsed(true);
        setIsDragging(false);
        setDragOffset({ x: 0, y: 0 });
      }
    };

    const handleMouseUp = () => {
      console.log('Mouse up, stopping drag');
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 }); // Reset position
    };

    if (isDragging) {
      console.log('Adding event listeners for drag');
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    // Always prevent propagation when touching navigation area
    e.preventDefault();
    e.stopPropagation();

    if (isCollapsed) return;

    // Only allow dragging on the navigation area, not on buttons
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return; // Don't start drag if touching a button
    }

    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setDragOffset({ x: 0, y: 0 });
    console.log('Touch start:', { x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isCollapsed) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStart.y;
    const deltaX = touch.clientX - dragStart.x;

    // Update drag offset for visual feedback (limit the movement)
    const clampedY = Math.max(0, Math.min(deltaY, 100)); // Limit downward movement
    const clampedX = Math.max(-50, Math.min(deltaX, 50)); // Limit horizontal movement
    setDragOffset({ x: clampedX, y: clampedY });

    console.log('Touch move:', { deltaY, deltaX, clampedY });

    // If dragged down significantly (very sensitive threshold for touch)
    if (deltaY > 25) {
      console.log('Collapsing navigation via touch!');
      setIsCollapsed(true);
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleTouchEnd = () => {
    console.log('Touch end');
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 }); // Reset position
  };

  const renderNavigationButton = (item: any) => {
    // Check if this is the current page
    const isCurrentPage = (item.id === 'map' && currentPage === 'map') ||
                         (item.id === currentPage);

    return (
      <div
        key={item.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px'
        }}
      >
        <button
          onClick={(e) => {
            if (!isDragging) {
              handleNavigation(item.route);
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            background: isCurrentPage
              ? 'rgba(255,255,255,0.3)' // Dimmed background for current page
              : item.gradient,
            border: isCurrentPage
              ? '2px solid rgba(255,255,255,0.6)' // Border for current page
              : 'none',
            borderRadius: '50%',
            width: item.size,
            height: item.size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: item.fontSize,
            cursor: isCurrentPage ? 'default' : 'pointer',
            boxShadow: isCurrentPage
              ? `0 2px 8px rgba(255,255,255,0.2)` // Subtle shadow for current page
              : `0 4px 16px ${item.shadowColor}`,
            color: 'white',
            transition: 'all 0.3s ease',
            opacity: isCurrentPage ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!isCurrentPage) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${item.shadowColorHover}`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isCurrentPage) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${item.shadowColor}`;
            }
          }}
        >
          {item.icon}
        </button>
        <span
          style={{
            fontSize: '10px',
            color: isCurrentPage ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
            fontWeight: isCurrentPage ? 'bold' : 'normal',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease'
          }}
        >
          {item.label}
        </span>
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(76,175,80,0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(76,175,80,0.7);
          }
        }
      `}</style>
      <div
        className="pointer-events-auto fixed z-50 left-1/2 -translate-x-1/2 bottom-[max(env(safe-area-inset-bottom),12px)] w-[min(720px,calc(100vw-24px))]"
        style={{ height: NAV_HEIGHT }}
      >
        <div
          ref={navRef}
          className="rounded-2xl shadow-lg ring-1 ring-black/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75"
          style={{
          background: isCollapsed
            ? 'rgba(76,175,80,0.9)'
            : 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: isCollapsed
            ? '2px solid rgba(255,255,255,0.3)'
            : '1px solid rgba(255,255,255,0.2)',
          borderRadius: isCollapsed ? '50%' : '25px',
          padding: isCollapsed ? '0' : '12px 8px',
          pointerEvents: 'auto',
          boxShadow: isCollapsed
            ? '0 4px 20px rgba(76,175,80,0.5)'
            : '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          gap: isCollapsed ? '0' : '6px',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          alignItems: 'center',
          cursor: isCollapsed ? 'pointer' : isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          width: isCollapsed ? '60px' : 'auto',
          height: isCollapsed ? '60px' : 'auto',
          overflow: 'hidden',
          // Add pulsing animation when collapsed, follow hand when dragging
          animation: isCollapsed ? 'pulse 2s infinite' : 'none',
          transform: isCollapsed
            ? 'none'
            : isDragging
              ? `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(0.95) rotate(${dragOffset.x * 0.1}deg)`
              : 'none',
          opacity: isDragging ? 0.7 : 1,
          // Add touch-action to prevent scrolling
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
        onMouseDown={!isCollapsed ? handleMouseDown : undefined}
        onTouchStart={!isCollapsed ? handleTouchStart : undefined}
        onTouchMove={!isCollapsed ? handleTouchMove : undefined}
        onTouchEnd={handleTouchEnd}
        onClick={isCollapsed ? handleClick : undefined}
        onTouchCancel={handleTouchEnd}
      >
      {isCollapsed ? (
        // Collapsed state - show navigation icon with expand hint
        <div style={{
          fontSize: '24px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
          height: '100%'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}>
            <div style={{ fontSize: '20px' }}>⚡</div>
            <div style={{
              fontSize: '8px',
              opacity: 0.8,
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: '1'
            }}>
              TAP
            </div>
          </div>
        </div>
      ) : (
        // Expanded state - show navigation buttons with drag indicator
        <>
          {/* Drag Indicator */}
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '4px',
            backgroundColor: isDragging ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
            borderRadius: '2px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease'
          }} />

          {/* Drag instruction text when dragging */}
          {isDragging && (
            <div style={{
              position: 'absolute',
              top: '-35px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 'bold',
              textAlign: 'center',
              pointerEvents: 'none',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}>
              Pull down to collapse
            </div>
          )}

          {allItems.map(renderNavigationButton)}
        </>
      )}
        </div>
      </div>
    </>
  );
}
