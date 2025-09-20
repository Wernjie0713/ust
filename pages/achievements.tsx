import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamically import EnhancedAchievements to prevent SSR issues
const EnhancedAchievements = dynamic(() => import('../components/ecomon/EnhancedAchievements'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏆</div>
        <div>Loading Achievements...</div>
      </div>
    </div>
  )
});

export default function AchievementsPage() {
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
        <title>EcoMon Achievements - Badges & Milestones</title>
        <meta name="description" content="Track your achievements, complete challenges, and collect badges in your eco journey" />
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

      <EnhancedAchievements />
    </div>
  );
}
