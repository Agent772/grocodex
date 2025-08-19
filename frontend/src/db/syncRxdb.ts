import { RxDatabase } from 'rxdb';
import { GrocodexCollections } from '../types/dbCollections';
import { replicateCouchDB } from 'rxdb/plugins/replication-couchdb';

export interface SyncStatus {
  active: boolean;
  error?: string;
  lastSync?: Date;
}

export function startRxdbSync(db: RxDatabase<GrocodexCollections>, serverUrl: string, onStatus: (status: SyncStatus) => void) {
  const status: SyncStatus = { active: false };
  const replications: any[] = [];
  try {
    for (const name of Object.keys(db.collections)) {
      const collection = db.collections[name];
      const remoteUrl = `${serverUrl}/grocodex_${name}/`;
      const replicationState = replicateCouchDB({
        collection,
        url: remoteUrl,
        replicationIdentifier: name,
        pull: {},
        push: {},
        live: true,
        retryTime: 5000,
        autoStart: true,
      });
      replications.push(replicationState);
      status.active = true;
      replicationState.active$.subscribe(active => {
        status.active = active;
        if (!active) status.lastSync = new Date();
        onStatus({ ...status });
      });
      replicationState.error$.subscribe(error => {
        status.error = error.message || `Sync error (${name})`;
        onStatus({ ...status });
      });
    }
    onStatus({ ...status });
    return replications;
  } catch (err: any) {
    status.error = err.message || 'Sync error';
    onStatus({ ...status });
    return null;
  }
}
