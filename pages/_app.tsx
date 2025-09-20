import '../styles/globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import GlobalContext from '../contexts/globalContext';
import { AppProps } from 'next/app';
import { FC } from 'react';  // Import FC
// import '../styles/mapbox-directions-custom.css';

const App: FC<AppProps> = ({ Component, pageProps }) => {

  return (
    <GlobalContext>
      <Component {...pageProps} />
    </GlobalContext>
  );
};

export default App;
