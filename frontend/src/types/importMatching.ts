import { ParsedShoppingListItem } from '../utils/shoppingListParser';
import { ProductDocType, GroceryItemDocType } from './dbCollections';

/**
 * Type of match found for an imported item
 */
export type MatchType = 'exact' | 'name-unit' | 'fuzzy' | 'none';

/**
 * Status of a matched item in relation to pantry inventory
 */
export type MatchStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

/**
 * Result of matching a single parsed shopping list item against pantry inventory
 */
export interface MatchResult {
  /** The original parsed item from the shopping list */
  parsedItem: ParsedShoppingListItem;
  
  /** The matched product from the catalog (if any) */
  matchedProduct?: ProductDocType;
  
  /** All grocery items in pantry for this product (across all containers) */
  matchedGroceryItems?: GroceryItemDocType[];
  
  /** Type of match found */
  matchType: MatchType;
  
  /** Confidence score (0-1) for the match */
  confidence: number;
  
  /** Total quantity available in pantry (sum of all grocery items) */
  totalPantryQuantity: number;
  
  /** Calculated quantity needed (parsed quantity - pantry quantity) */
  needsQuantity: number;
  
  /** Status indicator based on availability */
  status: MatchStatus;
  
  /** Alternative product suggestions for fuzzy or no matches */
  suggestions?: ProductDocType[];
  
  /** User validation state */
  validated?: boolean;
  
  /** User's selection if they chose a different suggestion */
  userSelectedProduct?: ProductDocType;
}

/**
 * Options for configuring the matching algorithm
 */
export interface MatchingOptions {
  /** Minimum confidence threshold for fuzzy matching (0-1, default 0.7) */
  fuzzyThreshold?: number;
  
  /** Whether to consider quantity differences in matching (default true) */
  considerQuantity?: boolean;
  
  /** Maximum number of suggestions to return for ambiguous matches (default 3) */
  maxSuggestions?: number;
  
  /** Future: Optional AI enhancement hook for ambiguous matches */
  aiEnhancer?: (results: MatchResult[]) => Promise<MatchResult[]>;
  
  /** Future: Enable AI-enhanced matching */
  aiEnhanced?: boolean;
}

/**
 * Batch processing result for large imports
 */
export interface BatchMatchResult {
  /** Results for this batch */
  results: MatchResult[];
  
  /** Batch number (1-indexed) */
  batchNumber: number;
  
  /** Total number of batches */
  totalBatches: number;
  
  /** Whether this is the final batch */
  isComplete: boolean;
  
  /** Overall progress (0-1) */
  progress: number;
}
