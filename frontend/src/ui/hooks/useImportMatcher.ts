import { useRxDB } from 'rxdb-hooks';
import { ParsedShoppingListItem } from '../../utils/shoppingListParser';
import { ProductDocType, GroceryItemDocType } from '../../types/dbCollections';
import {
  MatchResult,
  MatchingOptions,
  MatchType,
  MatchStatus,
  BatchMatchResult,
} from '../../types/importMatching';
import {
  calculateSimilarity,
  normalizeProductName,
  isSubstringMatch,
} from '../../utils/fuzzyMatch';
import {
  normalizeQuantitiesForComparison,
  sumQuantitiesInUnit,
  areUnitsCompatible,
} from '../../utils/unitConverter';

/**
 * Default batch size for processing large imports
 */
const DEFAULT_BATCH_SIZE = 10;

/**
 * Hook for matching imported shopping list items against pantry inventory
 * Implements multi-tier matching: exact -> name-unit -> fuzzy -> none
 */
export function useImportMatcher(options?: MatchingOptions) {
  const db = useRxDB();
  
  const fuzzyThreshold = options?.fuzzyThreshold ?? 0.7;
  const considerQuantity = options?.considerQuantity ?? true;
  const maxSuggestions = options?.maxSuggestions ?? 3;

  /**
   * Match a single parsed item against products in the catalog
   */
  async function matchSingleItem(
    parsedItem: ParsedShoppingListItem
  ): Promise<MatchResult> {
    if (!db) {
      throw new Error('RxDB not initialized');
    }

    const { name, quantity, unit } = parsedItem;

    // Default result structure
    let matchResult: MatchResult = {
      parsedItem,
      matchType: 'none',
      confidence: 0,
      totalPantryQuantity: 0,
      needsQuantity: quantity ?? 0,
      status: 'out-of-stock',
      suggestions: [],
    };

    // Tier 1: Exact name match with compatible unit (ignore quantity)
    if (name && unit) {
      const exactMatch = await findExactNameMatch(name, unit);
      if (exactMatch) {
        return await buildMatchResult(parsedItem, exactMatch, 'exact', 1.0);
      }
    }

    // Tier 2: Contains/substring match with compatible unit
    if (name && unit) {
      const substringMatches = await findSubstringMatches(name, unit);
      if (substringMatches.length > 0) {
        if (substringMatches.length === 1) {
          // Single match - use it directly
          return await buildMatchResult(parsedItem, substringMatches[0], 'name-unit', 0.95);
        } else {
          // Multiple matches - return first as match, rest as suggestions
          const result = await buildMatchResult(parsedItem, substringMatches[0], 'name-unit', 0.95);
          result.suggestions = substringMatches.slice(1);
          return result;
        }
      }
    }

    // Tier 3: Fuzzy name match with unit compatibility
    if (name) {
      const fuzzyMatches = await findFuzzyMatches(name, unit);
      
      // Filter matches that meet the threshold
      const matchesAboveThreshold = fuzzyMatches.filter(m => m.similarity >= fuzzyThreshold);
      
      if (matchesAboveThreshold.length > 0) {
        // Handle like Tier 2 multi-match: always show as dropdown options (even for single match)
        const bestMatch = matchesAboveThreshold[0];
        const result = await buildMatchResult(
          parsedItem,
          bestMatch.product,
          'fuzzy',
          bestMatch.similarity
        );
        // Add other matches above threshold as suggestions
        result.suggestions = matchesAboveThreshold.slice(1, maxSuggestions + 1).map(m => m.product);
        return result;
      }
    }

    return matchResult;
  }

  /**
   * Find exact name match with compatible unit family (e.g., g/kg or ml/l)
   * Checks both product names and product group names
   */
  async function findExactNameMatch(
    name: string,
    unit: string
  ): Promise<ProductDocType | null> {
    if (!db) return null;

    // Normalize names for comparison
    const normalizedSearchName = normalizeProductName(name, false); // Don't remove common words for exact match

    // Get all products
    const allProducts = await db.collections.product.find().exec();
    const products = allProducts.map((doc: any) => doc.toJSON() as ProductDocType);

    for (const product of products) {
      const normalizedProductName = normalizeProductName(product.name, false);
      
      // Check exact name match
      if (normalizedProductName === normalizedSearchName) {
        // Check if units are compatible
        if (areUnitsCompatible(unit, product.unit)) {
          return product;
        }
      }
    }

    // Also check product groups
    const allGroups = await db.collections.product_group.find().exec();
    const groups = allGroups.map((doc: any) => doc.toJSON());

    for (const group of groups) {
      const normalizedGroupName = normalizeProductName(group.name, false);
      
      if (normalizedGroupName === normalizedSearchName) {
        // Find first product in this group with compatible unit
        const matchingProduct = products.find((p: ProductDocType) => 
          p.product_group_id === group.id && areUnitsCompatible(unit, p.unit)
        );
        
        if (matchingProduct) {
          return matchingProduct;
        }
      }
    }

    return null;
  }

  /**
   * Find all substring/contains matches with compatible unit family
   * e.g., "Spaghetti" matches "Dinkel Spaghetti", "Barilla Spaghetti", etc.
   * Returns all matches sorted by name length (shortest/most specific first)
   */
  async function findSubstringMatches(
    name: string,
    unit: string
  ): Promise<ProductDocType[]> {
    if (!db) return [];

    const normalizedSearchName = normalizeProductName(name, true);

    // Get all products
    const allProducts = await db.collections.product.find().exec();
    const products = allProducts.map((doc: any) => doc.toJSON() as ProductDocType);

    // Collect all substring matches with compatible units
    const matches: Array<{ product: ProductDocType; matchLength: number }> = [];

    for (const product of products) {
      const normalizedProductName = normalizeProductName(product.name, true);
      
      // Check if search name is contained in product name or vice versa
      if (normalizedProductName.includes(normalizedSearchName) || 
          normalizedSearchName.includes(normalizedProductName)) {
        
        // Check if units are compatible
        if (areUnitsCompatible(unit, product.unit)) {
          matches.push({
            product,
            matchLength: product.name.length
          });
        }
      }
    }

    if (matches.length === 0) {
      return [];
    }

    // Sort by name length (shortest first = most specific)
    // e.g., "Spaghetti" comes before "Dinkel Spaghetti" or "Barilla Spaghetti"
    matches.sort((a, b) => a.matchLength - b.matchLength);

    // Return all matches
    return matches.map(m => m.product);
  }

  /**
   * Find fuzzy matches using similarity scoring
   */
  async function findFuzzyMatches(
    name: string,
    unit?: string
  ): Promise<Array<{ product: ProductDocType; similarity: number }>> {
    if (!db) return [];

    // Fetch all products (could be optimized with indexing/filtering)
    const allProducts = await db.collections.product.find().exec();
    const products = allProducts.map((doc: any) => doc.toJSON() as ProductDocType);

    const normalizedSearchName = normalizeProductName(name);

    // Calculate similarity for each product
    const matches = products
      .map((product: ProductDocType) => {
        let similarity = calculateSimilarity(
          normalizedSearchName,
          normalizeProductName(product.name)
        );

        // Boost score if substring match
        if (isSubstringMatch(name, product.name)) {
          similarity = Math.min(1.0, similarity + 0.2);
        }

        // Boost score if units match
        if (unit && unit === product.unit) {
          similarity = Math.min(1.0, similarity + 0.1);
        } else if (unit && areUnitsCompatible(unit, product.unit)) {
          similarity = Math.min(1.0, similarity + 0.05);
        }

        return { product, similarity };
      })
      .filter((match: { product: ProductDocType; similarity: number }) => match.similarity > 0)
      .sort((a: { product: ProductDocType; similarity: number }, b: { product: ProductDocType; similarity: number }) => b.similarity - a.similarity);

    return matches;
  }

  /**
   * Build complete match result with pantry inventory data
   */
  async function buildMatchResult(
    parsedItem: ParsedShoppingListItem,
    product: ProductDocType,
    matchType: MatchType,
    confidence: number
  ): Promise<MatchResult> {
    if (!db) {
      throw new Error('RxDB not initialized');
    }

    // Find all grocery items for this product
    const groceryItemDocs = await db.collections.grocery_item
      .find({
        selector: { product_id: product.id },
      })
      .exec();

    const groceryItems = groceryItemDocs.map((doc: any) =>
      doc.toJSON()
    ) as GroceryItemDocType[];

    // Calculate total pantry quantity (sum across all containers)
    let totalPantryQuantity = 0;

    if (groceryItems.length > 0) {
      // Try to sum in the product's unit
      const quantities = groceryItems.map((item) => ({
        quantity: item.rest_quantity ?? 0,
        unit: product.unit,
      }));

      const sum = sumQuantitiesInUnit(quantities, product.unit);
      totalPantryQuantity = sum ?? 0;
    }

    // Normalize parsed quantity to product unit for comparison
    let normalizedParsedQuantity = parsedItem.quantity ?? 0;

    if (parsedItem.unit && parsedItem.unit !== product.unit) {
      const normalized = normalizeQuantitiesForComparison(
        parsedItem.quantity ?? 0,
        parsedItem.unit,
        totalPantryQuantity,
        product.unit
      );

      if (normalized) {
        normalizedParsedQuantity = normalized.quantity1;
        totalPantryQuantity = normalized.quantity2; // Already in correct unit
      }
    }

    // Calculate need
    const needsQuantity = Math.max(0, normalizedParsedQuantity - totalPantryQuantity);

    // Determine status
    let status: MatchStatus;
    if (totalPantryQuantity === 0) {
      status = 'out-of-stock';
    } else if (totalPantryQuantity >= normalizedParsedQuantity) {
      status = 'in-stock';
    } else {
      status = 'low-stock';
    }

    return {
      parsedItem,
      matchedProduct: product,
      matchedGroceryItems: groceryItems,
      matchType,
      confidence,
      totalPantryQuantity,
      needsQuantity,
      status,
      suggestions: [],
    };
  }

  /**
   * Match multiple items in batches
   * Returns results progressively as each batch completes
   */
  async function* matchItemsInBatches(
    items: ParsedShoppingListItem[],
    batchSize: number = DEFAULT_BATCH_SIZE,
    onBatchComplete?: (batchResult: BatchMatchResult) => void
  ): AsyncGenerator<BatchMatchResult, void, unknown> {
    const totalBatches = Math.ceil(items.length / batchSize);

    for (let i = 0; i < items.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      const batch = items.slice(i, i + batchSize);

      // Process batch in parallel
      const results = await Promise.all(
        batch.map((item) => matchSingleItem(item))
      );

      const batchResult: BatchMatchResult = {
        results,
        batchNumber,
        totalBatches,
        isComplete: batchNumber === totalBatches,
        progress: batchNumber / totalBatches,
      };

      // Notify callback if provided
      if (onBatchComplete) {
        onBatchComplete(batchResult);
      }

      yield batchResult;
    }
  }

  /**
   * Match all items and return complete results
   */
  async function matchAllItems(
    items: ParsedShoppingListItem[]
  ): Promise<MatchResult[]> {
    const results: MatchResult[] = [];

    for await (const batch of matchItemsInBatches(items)) {
      results.push(...batch.results);
    }

    return results;
  }

  /**
   * Apply AI enhancement if configured (hook for future implementation)
   */
  async function applyAIEnhancement(
    results: MatchResult[]
  ): Promise<MatchResult[]> {
    if (!options?.aiEnhanced || !options?.aiEnhancer) {
      return results;
    }

    // Future: Call AI agent to re-rank, resolve ambiguities, etc.
    // This hook allows integration with LLM or other AI services
    // Example: Read ai_token from app_config, call external API
    return await options.aiEnhancer(results);
  }

  return {
    matchSingleItem,
    matchAllItems,
    matchItemsInBatches,
    applyAIEnhancement,
  };
}
