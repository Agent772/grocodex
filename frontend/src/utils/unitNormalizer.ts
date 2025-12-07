import { UNIT_OPTIONS, TEMP_UNIT_OPTIONS } from '../types/unitOptions';

/**
 * Ambiguous units that could represent different measurements depending on the ingredient.
 * These are kept as-is for later resolution during product matching.
 * For example: 1 tsp of liquid = ~5ml, but 1 tsp of salt = ~5g
 *              1 tbsp of liquid = ~15ml, but 1 tbsp of salt = ~15g
 */
const AMBIGUOUS_UNITS: Record<string, string> = {
  // Teaspoon (German) - Keep as 'tsp' for later resolution
  'tl': 'tsp',
  'teelöffel': 'tsp',
  'teeloeffel': 'tsp',
  
  // Teaspoon (English) - Keep as 'tsp' for later resolution
  'tsp': 'tsp',
  'teaspoon': 'tsp',
  
  // Tablespoon (German) - Keep as 'tbsp' for later resolution
  'el': 'tbsp',
  'esslöffel': 'tbsp',
  'essloeffel': 'tbsp',
  
  // Tablespoon (English) - Keep as 'tbsp' for later resolution
  'tbsp': 'tbsp',
  'tablespoon': 'tbsp',
};

/**
 * Maps common German and English unit abbreviations to the app's standard units.
 * This is used when parsing shopping lists to normalize various unit formats.
 */
const UNIT_MAPPING: Record<string, string> = {
  // Grams
  'g': 'g',
  'gr': 'g',
  'gramm': 'g',
  'gram': 'g',
  
  // Kilograms
  'kg': 'kg',
  'kilo': 'kg',
  'kilogramm': 'kg',
  'kilogram': 'kg',
  
  // Milliliters
  'ml': 'ml',
  'milliliter': 'ml',
  
  // Liters
  'l': 'l',
  'liter': 'l',
  'litre': 'l',
  
  // Pieces (German)
  'stk': 'pcs',
  'stück': 'pcs',
  'stuck': 'pcs',
  'stueck': 'pcs',
  'st': 'pcs',
  
  // Pieces (English)
  'pcs': 'pcs',
  'pc': 'pcs',
  'piece': 'pcs',
  'pieces': 'pcs',
  'x': 'pcs',
  
  // Bundle (German)
  'bund': 'bundle',
  
  // Bundle (English)
  'bundle': 'bundle',
  'bunch': 'bundle',
  
  // Note: Teaspoon and Tablespoon are handled by UNIT_CONVERSIONS
  // They are converted to ml with appropriate factors
  
  // Package
  'packung': 'pkg',
  'pack': 'pkg',
  'pkg': 'pkg',
  'package': 'pkg',
  
  // Can
  'dose': 'pcs',
  'can': 'pcs',
  
  // Bottle
  'flasche': 'pcs',
  'bottle': 'pcs',
  
  // Glass/Jar
  'glas': 'pcs',
  'glass': 'pcs',
  'jar': 'pcs',
};

/**
 * Converts a quantity and unit, handling ambiguous units specially.
 * Ambiguous units (like teaspoon) are kept as-is for later resolution during product matching.
 * 
 * @param quantity - The quantity to convert
 * @param unit - The unit to convert from (e.g., "TL", "EL")
 * @returns Object with converted quantity and unit, or original values if no conversion
 */
export function convertUnit(quantity: number | undefined, unit: string | undefined): { quantity?: number; unit: string } {
  if (!unit) return { quantity, unit: 'pcs' };
  
  const normalized = unit.toLowerCase().trim();
  
  // Check if this is an ambiguous unit (e.g., teaspoon)
  const ambiguous = AMBIGUOUS_UNITS[normalized];
  if (ambiguous) {
    return {
      quantity,
      unit: ambiguous // Keep as 'tsp' for later resolution
    };
  }
  
  // No conversion needed, just normalize the unit
  return {
    quantity,
    unit: normalizeUnit(unit)
  };
}

/**
 * Normalizes a unit string to one of the app's standard units.
 * Returns the normalized unit or 'pcs' as fallback.
 * 
 * @param unit - The unit string to normalize (e.g., "TL", "Bund", "g")
 * @returns The normalized unit from UNIT_OPTIONS
 */
export function normalizeUnit(unit: string | undefined): string {
  if (!unit) return 'pcs';
  
  const normalized = unit.toLowerCase().trim();
  
  // Check if this is an ambiguous unit
  const ambiguous = AMBIGUOUS_UNITS[normalized];
  if (ambiguous) {
    return ambiguous;
  }
  
  const mapped = UNIT_MAPPING[normalized];
  
  // If we found a mapping and it's in our unit options, use it
  if (mapped && UNIT_OPTIONS.includes(mapped)) {
    return mapped;
  }
  
  // Check if it's a temporary unit (used during import but not for manual input)
  if (TEMP_UNIT_OPTIONS.includes(normalized)) {
    return normalized;
  }
  
  // If the unit is already in our options, use it as-is
  if (UNIT_OPTIONS.includes(normalized)) {
    return normalized;
  }
  
  // Default to pieces for unknown units
  return 'pcs';
}
