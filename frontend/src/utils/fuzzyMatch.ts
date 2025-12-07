/**
 * Fuzzy matching and text normalization utilities for product matching
 */

/**
 * Common words to remove during product name normalization
 */
const COMMON_WORDS = [
  // German articles and words
  'der', 'die', 'das', 'ein', 'eine', 'bio', 'frisch', 'frische',
  // English articles and words
  'the', 'a', 'an', 'organic', 'fresh',
  // Common descriptors
  'neu', 'new', 'premium',
];

/**
 * Normalizes a product name for comparison by:
 * - Converting to lowercase
 * - Trimming whitespace
 * - Removing special characters (keeping letters, numbers, spaces)
 * - Optionally removing common words
 * 
 * @param name - The product name to normalize
 * @param removeCommonWords - Whether to remove common articles/words (default: true)
 * @returns Normalized product name
 */
export function normalizeProductName(name: string, removeCommonWords: boolean = true): string {
  if (!name) return '';
  
  // Convert to lowercase and trim
  let normalized = name.toLowerCase().trim();
  
  // Remove special characters, keep letters, numbers, spaces
  normalized = normalized.replace(/[^a-z0-9äöüßáéíóúàèìòùâêîôû\s]/g, ' ');
  
  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Remove common words if requested
  if (removeCommonWords) {
    const words = normalized.split(' ');
    const filteredWords = words.filter(word => !COMMON_WORDS.includes(word));
    normalized = filteredWords.join(' ');
  }
  
  return normalized;
}

/**
 * Calculates the Levenshtein distance between two strings
 * (minimum number of single-character edits needed to transform one string into the other)
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create a 2D array for dynamic programming
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));
  
  // Initialize first column and row
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Calculates a similarity score between two strings using Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  if (maxLength === 0) return 1;
  
  return 1 - distance / maxLength;
}

/**
 * Finds the best fuzzy matches for a given name from a list of candidates
 * 
 * @param targetName - The name to match
 * @param candidates - Array of candidate names
 * @param threshold - Minimum similarity threshold (0-1, default 0.7)
 * @param maxResults - Maximum number of results to return (default 5)
 * @returns Array of matches with their similarity scores, sorted by score descending
 */
export function findFuzzyMatches(
  targetName: string,
  candidates: string[],
  threshold: number = 0.7,
  maxResults: number = 5
): Array<{ name: string; similarity: number }> {
  const normalizedTarget = normalizeProductName(targetName);
  
  const matches = candidates
    .map(candidate => ({
      name: candidate,
      similarity: calculateSimilarity(normalizedTarget, normalizeProductName(candidate))
    }))
    .filter(match => match.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults);
  
  return matches;
}

/**
 * Checks if two product names are an exact match after normalization
 * 
 * @param name1 - First product name
 * @param name2 - Second product name
 * @returns True if names match exactly after normalization
 */
export function isExactMatch(name1: string, name2: string): boolean {
  return normalizeProductName(name1) === normalizeProductName(name2);
}

/**
 * Checks if a target name is contained within a candidate name (substring match)
 * after normalization
 * 
 * @param targetName - The name to search for
 * @param candidateName - The name to search within
 * @returns True if target is a substring of candidate
 */
export function isSubstringMatch(targetName: string, candidateName: string): boolean {
  const normalizedTarget = normalizeProductName(targetName);
  const normalizedCandidate = normalizeProductName(candidateName);
  return normalizedCandidate.includes(normalizedTarget) || normalizedTarget.includes(normalizedCandidate);
}
