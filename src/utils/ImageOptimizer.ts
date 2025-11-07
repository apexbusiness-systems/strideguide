/**
 * Image Optimization Utilities
 * Compresses and optimizes images for better performance
 */

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

export interface OptimizationResult {
  blob: Blob;
  url: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

/**
 * Optimize image file
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'jpeg',
  } = options;

  const originalSize = file.size;

  // Load image
  const img = await loadImage(file);

  // Calculate new dimensions
  const { width, height } = calculateDimensions(
    img.width,
    img.height,
    maxWidth,
    maxHeight
  );

  // Create canvas and resize
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Draw resized image
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to blob
  const mimeType = `image/${format}`;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      mimeType,
      quality
    );
  });

  const optimizedSize = blob.size;
  const url = URL.createObjectURL(blob);

  // Cleanup
  canvas.width = 0;
  canvas.height = 0;

  return {
    blob,
    url,
    originalSize,
    optimizedSize,
    compressionRatio: originalSize / optimizedSize,
  };
}

/**
 * Load image from file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // Check if resize is needed
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<OptimizationResult> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.8,
    format: 'jpeg',
  });
}

/**
 * Batch optimize images
 */
export async function batchOptimizeImages(
  files: File[],
  options: OptimizationOptions = {}
): Promise<OptimizationResult[]> {
  const results: OptimizationResult[] = [];

  for (const file of files) {
    try {
      const result = await optimizeImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to optimize ${file.name}:`, error);
      // Continue with next file
    }
  }

  return results;
}

/**
 * Get image dimensions without loading full image
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.width, height: img.height };
}

/**
 * Check if image needs optimization
 */
export function needsOptimization(
  file: File,
  maxSize: number = 2 * 1024 * 1024 // 2MB
): boolean {
  return file.size > maxSize;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
