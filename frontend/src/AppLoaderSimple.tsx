
import React, { useEffect, useState } from 'react';
import { initRxdb } from './db/initRxdb';
import App from './App';
import { RxDBProvider } from './db/RxDBProvider';

const AppLoaderSimple: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);
  const [db, setDb] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    initRxdb()
      .then((dbInstance) => {
        if (!cancelled) {
          setDb(dbInstance);
          setDbReady(true);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'DB init error');
      });
    return () => { cancelled = true; };
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!dbReady || !db) return <div>Loading database...</div>;
  return (
    <RxDBProvider db={db}>
      <App />
    </RxDBProvider>
  );
};

export default AppLoaderSimple;
