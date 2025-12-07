/**
 * Unit conversion utilities for comparing quantities with different but compatible units
 */

/**
 * Base units for conversion groups
 */
type BaseUnit = 'g' | 'ml' | 'pcs';

/**
 * Conversion factors to base units
 */
const CONVERSION_TO_BASE: Record<string, { base: BaseUnit; factor: number }> = {
  // Weight conversions (base: grams)
  'g': { base: 'g', factor: 1 },
  'kg': { base: 'g', factor: 1000 },
  
  // Volume conversions (base: milliliters)
  'ml': { base: 'ml', factor: 1 },
  'l': { base: 'ml', factor: 1000 },
  
  // Count-based (no conversion)
  'pcs': { base: 'pcs', factor: 1 },
  'pkg': { base: 'pcs', factor: 1 },
  'bundle': { base: 'pcs', factor: 1 },
};

/**
 * Typical conversions for ambiguous units (tsp/tbsp)
 * These are approximations and may vary by ingredient
 */
const AMBIGUOUS_UNIT_CONVERSIONS = {
  // For liquids (default assumption)
  'tsp': { ml: 5, g: 5 },      // ~5ml for liquids, ~5g for dry
  'tbsp': { ml: 15, g: 15 },   // ~15ml for liquids, ~15g for dry
};

/**
 * Converts a quantity from one unit to a base unit
 * 
 * @param quantity - The quantity to convert
 * @param unit - The unit to convert from
 * @returns Object with converted quantity and base unit, or null if not convertible
 */
export function convertToBaseUnit(
  quantity: number,
  unit: string
): { quantity: number; unit: BaseUnit } | null {
  const conversion = CONVERSION_TO_BASE[unit];
  if (!conversion) return null;
  
  return {
    quantity: quantity * conversion.factor,
    unit: conversion.base
  };
}

/**
 * Checks if two units are compatible (can be converted to the same base unit)
 * 
 * @param unit1 - First unit
 * @param unit2 - Second unit
 * @returns True if units can be compared
 */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const conv1 = CONVERSION_TO_BASE[unit1];
  const conv2 = CONVERSION_TO_BASE[unit2];
  
  if (!conv1 || !conv2) return false;
  
  return conv1.base === conv2.base;
}

/**
 * Converts quantity from one unit to another if they are compatible
 * 
 * @param quantity - The quantity to convert
 * @param fromUnit - The unit to convert from
 * @param toUnit - The unit to convert to
 * @returns Converted quantity, or null if units are incompatible
 */
export function convertQuantity(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  // If units are the same, no conversion needed
  if (fromUnit === toUnit) return quantity;
  
  const fromConversion = CONVERSION_TO_BASE[fromUnit];
  const toConversion = CONVERSION_TO_BASE[toUnit];
  
  // Check if both units can be converted
  if (!fromConversion || !toConversion) return null;
  
  // Check if they have the same base unit
  if (fromConversion.base !== toConversion.base) return null;
  
  // Convert: quantity * (from_factor / to_factor)
  const converted = quantity * (fromConversion.factor / toConversion.factor);
  
  return converted;
}

/**
 * Resolves ambiguous units (tsp/tbsp) to actual units based on the target product unit
 * 
 * @param quantity - The quantity in ambiguous unit
 * @param ambiguousUnit - The ambiguous unit ('tsp' or 'tbsp')
 * @param targetUnit - The target product's unit (e.g., 'g', 'ml')
 * @returns Object with converted quantity and resolved unit
 */
export function resolveAmbiguousUnit(
  quantity: number,
  ambiguousUnit: 'tsp' | 'tbsp',
  targetUnit: string
): { quantity: number; unit: string } {
  const conversion = AMBIGUOUS_UNIT_CONVERSIONS[ambiguousUnit];
  
  if (!conversion) {
    // Unknown ambiguous unit, return as-is
    return { quantity, unit: ambiguousUnit };
  }
  
  // Determine which conversion to use based on target unit
  const targetConversion = CONVERSION_TO_BASE[targetUnit];
  
  if (!targetConversion) {
    // Can't determine, default to liquid (ml)
    return { quantity: quantity * conversion.ml, unit: 'ml' };
  }
  
  // Convert based on base unit type
  switch (targetConversion.base) {
    case 'g':
      // Target is weight, convert using dry approximation
      return { quantity: quantity * conversion.g, unit: 'g' };
    
    case 'ml':
      // Target is volume, convert using liquid approximation
      return { quantity: quantity * conversion.ml, unit: 'ml' };
    
    case 'pcs':
    default:
      // Target is count-based, can't convert meaningfully
      // Default to liquid assumption
      return { quantity: quantity * conversion.ml, unit: 'ml' };
  }
}

/**
 * Normalizes two quantities to the same unit for comparison
 * Handles ambiguous units by resolving them to the target unit
 * 
 * @param quantity1 - First quantity
 * @param unit1 - First unit
 * @param quantity2 - Second quantity
 * @param unit2 - Second unit (target unit)
 * @returns Both quantities in the target unit, or null if incompatible
 */
export function normalizeQuantitiesForComparison(
  quantity1: number,
  unit1: string,
  quantity2: number,
  unit2: string
): { quantity1: number; quantity2: number; unit: string } | null {
  // Handle ambiguous units in quantity1
  if (unit1 === 'tsp' || unit1 === 'tbsp') {
    const resolved = resolveAmbiguousUnit(quantity1, unit1, unit2);
    quantity1 = resolved.quantity;
    unit1 = resolved.unit;
  }
  
  // Handle ambiguous units in quantity2
  if (unit2 === 'tsp' || unit2 === 'tbsp') {
    // If unit2 is ambiguous and unit1 is not, resolve unit2 to unit1
    const resolved = resolveAmbiguousUnit(quantity2, unit2, unit1);
    quantity2 = resolved.quantity;
    unit2 = resolved.unit;
  }
  
  // If units are now the same, return them
  if (unit1 === unit2) {
    return { quantity1, quantity2, unit: unit1 };
  }
  
  // Try to convert quantity1 to unit2
  const converted1 = convertQuantity(quantity1, unit1, unit2);
  if (converted1 !== null) {
    return { quantity1: converted1, quantity2, unit: unit2 };
  }
  
  // Units are incompatible
  return null;
}

/**
 * Calculates the total quantity in a target unit from an array of quantities with different units
 * 
 * @param items - Array of {quantity, unit} objects
 * @param targetUnit - The unit to sum everything in
 * @returns Total quantity in target unit, or null if any conversion fails
 */
export function sumQuantitiesInUnit(
  items: Array<{ quantity: number; unit: string }>,
  targetUnit: string
): number | null {
  let total = 0;
  
  for (const item of items) {
    let quantity = item.quantity;
    let unit = item.unit;
    
    // Resolve ambiguous units
    if (unit === 'tsp' || unit === 'tbsp') {
      const resolved = resolveAmbiguousUnit(quantity, unit, targetUnit);
      quantity = resolved.quantity;
      unit = resolved.unit;
    }
    
    // Convert to target unit
    const converted = convertQuantity(quantity, unit, targetUnit);
    if (converted === null) {
      // Incompatible unit, can't sum
      return null;
    }
    
    total += converted;
  }
  
  return total;
}

/**
 * Gets a human-readable description of a unit conversion
 * 
 * @param quantity - The quantity to convert
 * @param fromUnit - The unit to convert from
 * @param toUnit - The unit to convert to
 * @returns Description string, or null if incompatible
 */
export function getConversionDescription(
  quantity: number,
  fromUnit: string,
  toUnit: string
): string | null {
  const converted = convertQuantity(quantity, fromUnit, toUnit);
  if (converted === null) return null;
  
  return `${quantity}${fromUnit} = ${converted.toFixed(2)}${toUnit}`;
}
