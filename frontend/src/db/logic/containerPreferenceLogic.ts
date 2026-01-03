import { RxDatabase } from 'rxdb';
import { GrocodexCollections } from '../../types/dbCollections';

/**
 * Calculates the preferred container for a product based on where most instances are stored.
 * Uses most recent updated_at as tie-breaker if multiple containers have equal counts.
 * Returns null if no grocery items exist for the product.
 */
export async function calculatePreferredContainer(
  db: RxDatabase<GrocodexCollections>,
  product_id: string
): Promise<string | null> {
  // Query all grocery items for this product
  const items = await db.collections.grocery_item
    .find({ selector: { product_id } })
    .exec();

  if (items.length === 0) {
    return null; // No items exist, preserve existing preference
  }

  // Group by container_id and count instances, track most recent update
  const containerCounts = new Map<string, { count: number; mostRecentUpdate: string }>();

  items.forEach((item) => {
    const data = item.toJSON();
    const containerId = data.container_id;
    const updatedAt = data.updated_at || data.created_at || '';

    const existing = containerCounts.get(containerId);
    if (existing) {
      existing.count += 1;
      // Update to most recent timestamp
      if (updatedAt > existing.mostRecentUpdate) {
        existing.mostRecentUpdate = updatedAt;
      }
    } else {
      containerCounts.set(containerId, { count: 1, mostRecentUpdate: updatedAt });
    }
  });

  // Find container with highest count, use most recent update as tie-breaker
  let preferredContainerId: string | null = null;
  let maxCount = 0;
  let mostRecentDate = '';

  containerCounts.forEach((data, containerId) => {
    if (
      data.count > maxCount ||
      (data.count === maxCount && data.mostRecentUpdate > mostRecentDate)
    ) {
      preferredContainerId = containerId;
      maxCount = data.count;
      mostRecentDate = data.mostRecentUpdate;
    }
  });

  return preferredContainerId;
}

/**
 * Debounced queue for syncing preferred containers.
 * Deduplicates requests for the same product_id and processes them in batches.
 */
class PreferredContainerSyncQueue {
  private queue = new Map<string, { db: RxDatabase<GrocodexCollections>; product_id: string }>();
  private timerId: NodeJS.Timeout | null = null;
  private readonly debounceMs = 300;

  /**
   * Adds a product to the sync queue. If already queued, replaces with latest request.
   */
  enqueue(db: RxDatabase<GrocodexCollections>, product_id: string): void {
    this.queue.set(product_id, { db, product_id });

    // Clear existing timer and start new one
    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    this.timerId = setTimeout(() => {
      this.processQueue();
    }, this.debounceMs);
  }

  /**
   * Processes all queued products and updates their preferred containers.
   */
  private async processQueue(): Promise<void> {
    if (this.queue.size === 0) return;

    // Get all queued items and clear queue
    const items = Array.from(this.queue.values());
    this.queue.clear();

    // Process each product
    for (const { db, product_id } of items) {
      try {
        // Calculate preferred container
        const preferredContainerId = await calculatePreferredContainer(db, product_id);

        // If null (no items exist), don't update - preserve existing preference
        if (preferredContainerId === null) {
          continue;
        }

        // Get current product
        const productDoc = await db.collections.product.findOne(product_id).exec();
        if (!productDoc) continue;

        const currentProduct = productDoc.toJSON();

        // Only update if different
        if (currentProduct.preferred_container_id !== preferredContainerId) {
          await productDoc.patch({
            preferred_container_id: preferredContainerId,
            updated_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Failed to sync preferred container for product ${product_id}:`, error);
      }
    }
  }
}

// Singleton queue instance
const syncQueue = new PreferredContainerSyncQueue();

/**
 * Queues a product for preferred container sync.
 * Deduplicates multiple calls for the same product within the debounce window.
 */
export function queuePreferredContainerSync(
  db: RxDatabase<GrocodexCollections>,
  product_id: string
): void {
  syncQueue.enqueue(db, product_id);
}
