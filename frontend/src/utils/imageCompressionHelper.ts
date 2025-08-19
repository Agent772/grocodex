// Helper to compress and resize images for local storage (IndexedDB, etc)
// Uses browser-image-compression for best results

import imageCompression from 'browser-image-compression';

export interface CompressOptions {
  maxWidthOrHeight?: number; // e.g. 800
  maxSizeMB?: number; // e.g. 0.2
  quality?: number; // e.g. 0.7
}

/**
 * Compress and resize an image file for local storage.
 * Returns a Blob (can be converted to base64 or URL).
 *
 * @param file - The image File to compress
 * @param options - Compression options
 * @returns Promise<Blob>
 */
export async function compressImage(file: File, options?: CompressOptions): Promise<Blob> {
  const defaultOptions = {
    maxWidthOrHeight: 800,
    maxSizeMB: 0.2,
    useWebWorker: true,
    initialQuality: options?.quality ?? 0.7,
  };
  const compressedFile = await imageCompression(file, {
    ...defaultOptions,
    ...options,
  });
  return compressedFile;
}

/**
 * Convert a Blob or File to a base64 data URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
