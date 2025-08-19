
import React, { useEffect, useState } from 'react';
import { initRxdb } from './db/initRxdb';
import App from './App';

const AppLoaderSimple: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    initRxdb()
      .then(() => {
        if (!cancelled) setDbReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'DB init error');
      });
    return () => { cancelled = true; };
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!dbReady) return <div>Loading database...</div>;
  return <App />;
};

export default AppLoaderSimple;
