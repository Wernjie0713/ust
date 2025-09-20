import Head from 'next/head';
import EcoMonGameMap from "../components/ecomon/EcoMonGameMap";
import MissionCompleteNotification from "../components/notifications/MissionCompleteNotification";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../utils/auth";

export default function Home() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);
  const [login, setLogin] = useState(false);

  // useEffect(() => {
  //   if(!isAuthenticated()) {
  //     router.push('/login');
  //   }
  // }, [])

  return (
    <>
      <Head>
        <title>EcoGo! - Gamified Recycling Platform</title>
        <meta name="description" content="EcoGo! - Gamified recycling platform for environmental action" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
          }
        `}</style>
      </Head>
      <EcoMonGameMap />
      <MissionCompleteNotification />
    </>
  );
}
