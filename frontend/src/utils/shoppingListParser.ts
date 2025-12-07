import { convertUnit } from './unitNormalizer';

export interface ParsedShoppingListItem {
  name: string;
  quantity?: number;
  quantityMin?: number; // For ranges (e.g., "100 - 150 g")
  quantityMax?: number; // For ranges (e.g., "100 - 150 g")
  unit?: string;
  rawQuantity?: string; // Original quantity string (e.g., "100 - 150 g", "½ - 1 TL")
  category?: string;
}

/**
 * Parses a shopping list text into structured items.
 * Supports both Cookidoo app format (with indentation) and desktop format (without indentation).
 * 
 * @param text - The raw shopping list text
 * @returns Array of parsed shopping list items
 */
export function parseShoppingList(text: string): ParsedShoppingListItem[] {
  const items: ParsedShoppingListItem[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentCategory: string | undefined;
  
  for (const line of lines) {
    // Check if line is a category header
    if (isCategoryHeader(line)) {
      currentCategory = extractCategory(line);
      continue;
    }
    
    // Skip empty lines
    if (!line) continue;
    
    // Parse the item line
    const item = parseItemLine(line);
    if (item) {
      item.category = currentCategory;
      items.push(item);
    }
  }
  
  return items;
}

/**
 * Checks if a line is a category header.
 * Matches patterns like:
 * - "GEMÜSE & FRISCHE KRÄUTER" (all caps)
 * - "[GEMÜSE & FRISCHE KRÄUTER]" (with brackets)
 */
function isCategoryHeader(line: string): boolean {
  // Match lines that are all uppercase (with spaces, &, and punctuation)
  const isAllCaps = /^[A-ZÄÖÜ\s&\.\-]+$/.test(line) && line.length > 3;
  // Match lines with brackets
  const hasBrackets = /^\[.*\]$/.test(line);
  
  return isAllCaps || hasBrackets;
}

/**
 * Extracts category name from a header line.
 */
function extractCategory(line: string): string {
  // Remove brackets if present
  return line.replace(/^\[|\]$/g, '').trim();
}

/**
 * Parses a single item line into structured data.
 * Handles various formats:
 * - "500 g Eisbergsalat" (quantity at start)
 * - "Eisbergsalat 500 g" (quantity at end)
 * - "1 Bund Petersilie" (quantity with unit word)
 * - "Schwarzer Trüffel aus dem Glas" (no quantity)
 * - "100 - 150 g Gelbe Rüben" (quantity range)
 * - "½ - 1 TL Weißweinessig" (with fraction)
 */
function parseItemLine(line: string): ParsedShoppingListItem | null {
  if (!line) return null;
  
  // Pattern 1: Quantity at the start (App format)
  // e.g., "500 g Eisbergsalat", "1 Bund Petersilie", "100 - 150 g Gelbe Rüben"
  const startQuantityMatch = line.match(/^([\d\.,\-\s½¼¾⅓⅔⅛⅜⅝⅞]+)\s*([a-zA-ZäöüÄÖÜß]+)?\s+(.+)$/);
  if (startQuantityMatch) {
    const [, rawQty, unit, name] = startQuantityMatch;
    const { quantity, quantityMin, quantityMax, unit: parsedUnit } = parseQuantity(rawQty.trim(), unit?.trim());
    
    return {
      name: name.trim(),
      quantity,
      quantityMin,
      quantityMax,
      unit: parsedUnit,
      rawQuantity: unit ? `${rawQty.trim()} ${unit.trim()}` : rawQty.trim()
    };
  }
  
  // Pattern 2: Quantity at the end (Desktop format)
  // e.g., "Eisbergsalat 500 g", "Petersilie 1 Bund", "Weizenmehl Type 550 oder 700 500 g"
  // Parse from right to left: match unit + quantity OR just quantity at the very end
  // First try: with unit at the end
  const endWithUnitMatch = line.match(/^(.+?)\s+([\d\.,½¼¾⅓⅔⅛⅜⅝⅞]+(?:\s*-\s*[\d\.,½¼¾⅓⅔⅛⅜⅝⅞]+)?)\s+([a-zA-ZäöüÄÖÜß]+)\s*$/);
  if (endWithUnitMatch) {
    const [, name, rawQty, unit] = endWithUnitMatch;
    const { quantity, quantityMin, quantityMax, unit: parsedUnit } = parseQuantity(rawQty.trim(), unit.trim());
    
    return {
      name: name.trim(),
      quantity,
      quantityMin,
      quantityMax,
      unit: parsedUnit,
      rawQuantity: `${rawQty.trim()} ${unit.trim()}`
    };
  }
  
  // Second try: quantity without unit at the very end (only if it's a range with dash, or single number)
  const endNoUnitMatch = line.match(/^(.+?)\s+([\d\.,½¼¾⅓⅔⅛⅜⅝⅞]+(?:\s*-\s*[\d\.,½¼¾⅓⅔⅛⅜⅝⅞]+)?)\s*$/);
  if (endNoUnitMatch) {
    const [, name, rawQty] = endNoUnitMatch;
    // Only parse as quantity if:
    // 1. It contains a range (has dash between numbers), OR
    // 2. The name doesn't end with a number (to avoid "Type 550" cases)
    const hasRange = /-/.test(rawQty);
    const nameEndsWithNumber = /\d+\s*$/.test(name);
    
    if (hasRange || !nameEndsWithNumber) {
      const { quantity, quantityMin, quantityMax, unit: parsedUnit } = parseQuantity(rawQty.trim());
      
      return {
        name: name.trim(),
        quantity,
        quantityMin,
        quantityMax,
        unit: parsedUnit,
        rawQuantity: rawQty.trim()
      };
    }
  }
  
  // Pattern 3: No quantity (just the item name)
  // e.g., "Schwarzer Trüffel aus dem Glas", "Nudeln"
  return {
    name: line.trim()
  };
}

/**
 * Parses quantity string and extracts numeric value and unit.
 * Handles:
 * - Simple numbers: "500" -> { quantity: 500, unit: "g" }
 * - Numbers without unit: "1" -> { quantity: 1, unit: "pcs" }
 * - Decimals: "1.5", "1,5" -> { quantity: 1.5 }
 * - Ranges: "100 - 150" -> { quantityMin: 100, quantityMax: 150, quantity: 100 } (uses minimum)
 * - Fractions: "½" -> { quantity: 0.5 }
 * - Mixed: "1.5 - 2" -> { quantityMin: 1.5, quantityMax: 2, quantity: 1.5 } (uses minimum)
 */
function parseQuantity(rawQty: string, unit?: string): { quantity?: number; quantityMin?: number; quantityMax?: number; unit?: string } {
  // Convert fractions to decimals
  const convertedQty = rawQty
    .replace(/½/g, '0.5')
    .replace(/¼/g, '0.25')
    .replace(/¾/g, '0.75')
    .replace(/⅓/g, '0.33')
    .replace(/⅔/g, '0.67')
    .replace(/⅛/g, '0.125')
    .replace(/⅜/g, '0.375')
    .replace(/⅝/g, '0.625')
    .replace(/⅞/g, '0.875')
    .replace(/,/g, '.'); // German decimal separator
  
  // Check for range (e.g., "100 - 150")
  const rangeMatch = convertedQty.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    // Convert unit if needed (e.g., TL to ml)
    const convertedMin = convertUnit(min, unit);
    const convertedMax = convertUnit(max, unit);
    
    return { 
      quantity: convertedMin.quantity, // Use minimum value for ranges
      quantityMin: convertedMin.quantity, 
      quantityMax: convertedMax.quantity, 
      unit: convertedMin.unit 
    };
  }
  
  // Simple number
  const numberMatch = convertedQty.match(/[\d.]+/);
  if (numberMatch) {
    const quantity = parseFloat(numberMatch[0]);
    // Convert unit if needed (e.g., TL to ml)
    const converted = convertUnit(quantity, unit);
    return { quantity: converted.quantity, unit: converted.unit };
  }
  
  // No quantity, just normalize the unit
  const converted = convertUnit(undefined, unit);
  return { unit: converted.unit };
}
