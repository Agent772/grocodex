import React, { createContext, useContext } from 'react';
import { RxDatabase } from 'rxdb';
import { GrocodexCollections } from '../types/dbCollections';

export const RxDBContext = createContext<RxDatabase<GrocodexCollections> | null>(null);

export const RxDBProvider: React.FC<{ db: RxDatabase<GrocodexCollections>, children: React.ReactNode }> = ({ db, children }) => (
  <RxDBContext.Provider value={db}>{children}</RxDBContext.Provider>
);

export function useRxDB() {
  return useContext(RxDBContext);
}
