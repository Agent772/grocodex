// Global unit options for Grocodex
export const UNIT_OPTIONS = [
  'g',
  'kg',
  'ml',
  'l',
  'pcs',
  'pkg',
  'bundle'
];

// Temporary/ambiguous units used during import parsing
// These are not available for manual input but can appear in parsed shopping lists
export const TEMP_UNIT_OPTIONS = [
  'tsp', // Ambiguous unit: teaspoon (can be ~5ml for liquids or ~5g for dry ingredients)
  'tbsp' // Ambiguous unit: tablespoon (can be ~15ml for liquids or ~15g for dry ingredients)
];
