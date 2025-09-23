
import React, { useEffect, useState } from 'react';
import { RxDatabase } from 'rxdb';
import { GrocodexCollections } from './types/dbCollections';
import { initRxdb } from './db/initRxdb';
import App from './App';
import { Provider } from 'rxdb-hooks';
import { useTranslation } from 'react-i18next';

const AppLoaderSimple: React.FC = () => {
  const [dbReady, setDbReady] = useState(false);
  const [db, setDb] = useState<RxDatabase<GrocodexCollections> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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
  if (!dbReady || !db) return <div>{t('loading.database', 'Loading database...')}</div>;
  return (
    <Provider db={db}>
      <App />
    </Provider>
  );
};

export default AppLoaderSimple;
