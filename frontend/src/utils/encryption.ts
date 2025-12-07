/**
 * Security utilities for encrypting/decrypting sensitive data
 * Uses Web Crypto API for AES-GCM encryption
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM

/**
 * Derives a device-specific encryption key from multiple entropy sources
 * This creates a unique key per device/browser that persists across sessions
 */
async function getDerivedKey(): Promise<CryptoKey> {
  // Combine multiple entropy sources for device fingerprinting
  const entropy = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset().toString(),
    screen.width + 'x' + screen.height,
    navigator.hardwareConcurrency?.toString() || '0',
    // Add a stable random seed stored in localStorage (created once per device)
    getOrCreateDeviceSeed()
  ].join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(entropy);
  
  // Hash the entropy to create key material
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Import as a key
  return crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: ALGORITHM, length: KEY_LENGTH },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Gets or creates a persistent device-specific random seed
 */
function getOrCreateDeviceSeed(): string {
  const SEED_KEY = 'grocodex_device_seed';
  let seed = localStorage.getItem(SEED_KEY);
  
  if (!seed) {
    // Generate a new random seed
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    seed = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(SEED_KEY, seed);
  }
  
  return seed;
}

/**
 * Encrypts a string value using AES-GCM
 * Returns base64-encoded encrypted data with IV prepended
 */
export async function encryptValue(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  
  try {
    const key = await getDerivedKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Generate a random IV for this encryption
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );
    
    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypts a base64-encoded encrypted string
 * Returns the original plaintext
 */
export async function decryptValue(encrypted: string): Promise<string> {
  if (!encrypted) return '';
  
  try {
    const key = await getDerivedKey();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    
    // Split IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH);
    
    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encryptedData
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    // Return empty string on decryption failure (e.g., corrupted data)
    return '';
  }
}

/**
 * Checks if a value is encrypted (base64 format check)
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  // Check if it looks like base64 and is long enough to contain IV + data
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return base64Regex.test(value) && value.length > 16;
}
