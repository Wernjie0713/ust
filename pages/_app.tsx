import '../styles/globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import GlobalContext from '../contexts/globalContext';
import BottomNavigation from '../components/navigation/BottomNavigation';
import { AppProps } from 'next/app';
import { FC } from 'react';  // Import FC
// import '../styles/mapbox-directions-custom.css';

const App: FC<AppProps> = ({ Component, pageProps }) => {

  return (
    <GlobalContext>
      <main className="min-h-screen pb-safe">
        <Component {...pageProps} />
      </main>
      <BottomNavigation />
    </GlobalContext>
  );
};

export default App;
