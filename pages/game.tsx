import React, { useState } from 'react';
import GameHub from '../components/ecomon/GameHub';
import BottomNavigation from '../components/navigation/BottomNavigation';

export default function GamePage() {
  const [showNavigation, setShowNavigation] = useState(true);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      <GameHub onViewChange={(view) => setShowNavigation(view === 'dashboard')} />
      {showNavigation && <BottomNavigation currentPage="game" />}
    </div>
  );
}
