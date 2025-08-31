import { RxCollection } from 'rxdb';

interface WithTimestamps {
  created_at?: string;
  updated_at?: string;
}

/**
 * Adds a preInsert hook to set created_at to current ISO timestamp if not present.
 */
export function addCreatedAtHook<T extends WithTimestamps>(collection: RxCollection<T>) {
  collection.preInsert((doc) => {
    if (!doc.created_at) {
      doc.created_at = new Date().toISOString();
    }
  }, false);
}

/**
 * Adds a preSave hook to set updated_at to current ISO timestamp on every save.
 */
export function addUpdatedAtHook<T extends WithTimestamps>(collection: RxCollection<T>) {
  collection.preSave((doc) => {
    doc.updated_at = new Date().toISOString();
  }, false);
}
