import Head from 'next/head';
import { useRouter } from 'next/router';
import UserProfile from '../components/ecomon/UserProfile';

export default function ProfilePage() {
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
        <title>EcoMon Profile - Your Eco Journey</title>
        <meta name="description" content="Track your recycling progress, achievements, and compete with other EcoWarriors" />
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

      <UserProfile />
    </div>
  );
}
