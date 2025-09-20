import Head from 'next/head';
import { useRouter } from 'next/router';
import VoucherRewards from '../components/ecomon/VoucherRewards';
import BottomNavigation from '../components/navigation/BottomNavigation';

export default function VouchersPage() {
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
        <title>EcoMon Vouchers - Trade Battle Wins for Rewards</title>
        <meta name="description" content="Trade your battle victories for digital vouchers and exclusive rewards" />
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

      <VoucherRewards />

      <BottomNavigation currentPage="vouchers" />
    </div>
  );
}
