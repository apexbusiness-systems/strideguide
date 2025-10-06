/**
 * Lightweight Visual Fingerprint Engine
 * Phase 1: Perceptual hash + simple keypoint sampling
 * On-device only, no external dependencies
 */

export interface VisualSignature {
  phash: string; // 64-bit perceptual hash as hex
  keypoints: Array<{ x: number; y: number; intensity: number }>;
  width: number;
  height: number;
  timestamp: number;
}

export interface ProximityEstimate {
  similarity: number; // 0-1
  distance: 'very_close' | 'close' | 'medium' | 'far';
  confidence: number;
}

/**
 * Compute perceptual hash (pHash) of image
 * Returns 64-bit hash as hex string
 */
export function computePerceptualHash(imageData: ImageData): string {
  const size = 32;
  const smallSize = 8;
  
  // Resize to 32x32 grayscale
  const gray = resizeAndGrayscale(imageData, size);
  
  // Apply DCT
  const dct = applyDCT(gray, size);
  
  // Extract 8x8 top-left coefficients (excluding DC)
  const coeffs: number[] = [];
  for (let y = 0; y < smallSize; y++) {
    for (let x = 0; x < smallSize; x++) {
      if (x === 0 && y === 0) continue; // Skip DC component
      coeffs.push(dct[y * size + x]);
    }
  }
  
  // Compute median
  const sorted = [...coeffs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  
  // Generate hash: 1 if above median, 0 otherwise
  let hash = '';
  for (let i = 0; i < coeffs.length; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4 && i + j < coeffs.length; j++) {
      if (coeffs[i + j] > median) {
        nibble |= (1 << j);
      }
    }
    hash += nibble.toString(16);
  }
  
  return hash.padEnd(16, '0');
}

/**
 * Extract simple keypoints (high-contrast corners)
 * Returns top N strongest corners
 */
export function extractKeypoints(
  imageData: ImageData, 
  maxPoints: number = 20
): Array<{ x: number; y: number; intensity: number }> {
  const { width, height, data } = imageData;
  const keypoints: Array<{ x: number; y: number; intensity: number }> = [];
  
  // Convert to grayscale intensities
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  
  // Compute simple corner response (Sobel-based)
  const border = 3;
  for (let y = border; y < height - border; y += 4) { // Sample every 4 pixels
    for (let x = border; x < width - border; x += 4) {
      const idx = y * width + x;
      
      // Sobel gradients
      const gx = (
        -gray[idx - 1 - width] + gray[idx + 1 - width] +
        -2 * gray[idx - 1] + 2 * gray[idx + 1] +
        -gray[idx - 1 + width] + gray[idx + 1 + width]
      );
      
      const gy = (
        -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1] +
        gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1]
      );
      
      const intensity = Math.sqrt(gx * gx + gy * gy);
      
      if (intensity > 50) { // Threshold for corner strength
        keypoints.push({ 
          x: x / width, 
          y: y / height, 
          intensity 
        });
      }
    }
  }
  
  // Sort by intensity and take top N
  keypoints.sort((a, b) => b.intensity - a.intensity);
  return keypoints.slice(0, maxPoints);
}

/**
 * Compare two perceptual hashes (Hamming distance)
 * Returns similarity 0-1 (1 = identical)
 */
export function compareHashes(hash1: string, hash2: string): number {
  let distance = 0;
  const len = Math.min(hash1.length, hash2.length);
  
  for (let i = 0; i < len; i++) {
    const a = parseInt(hash1[i], 16);
    const b = parseInt(hash2[i], 16);
    const xor = a ^ b;
    
    // Count bits
    for (let bit = 0; bit < 4; bit++) {
      if (xor & (1 << bit)) distance++;
    }
  }
  
  const maxBits = len * 4;
  return 1 - (distance / maxBits);
}

/**
 * Compare keypoint sets using nearest-neighbor matching
 * Returns match ratio 0-1
 */
export function compareKeypoints(
  kp1: Array<{ x: number; y: number; intensity: number }>,
  kp2: Array<{ x: number; y: number; intensity: number }>,
  threshold: number = 0.05
): number {
  if (kp1.length === 0 || kp2.length === 0) return 0;
  
  let matches = 0;
  
  for (const p1 of kp1) {
    let minDist = Infinity;
    
    for (const p2 of kp2) {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      minDist = Math.min(minDist, dist);
    }
    
    if (minDist < threshold) {
      matches++;
    }
  }
  
  return matches / kp1.length;
}

/**
 * Estimate proximity based on signature comparison
 */
export function estimateProximity(
  liveSignature: VisualSignature,
  learnedSignatures: VisualSignature[]
): ProximityEstimate {
  let maxSimilarity = 0;
  
  for (const learned of learnedSignatures) {
    // Combine hash and keypoint similarity
    const hashSim = compareHashes(liveSignature.phash, learned.phash);
    const keypointSim = compareKeypoints(liveSignature.keypoints, learned.keypoints);
    
    // Weighted combination
    const similarity = hashSim * 0.6 + keypointSim * 0.4;
    maxSimilarity = Math.max(maxSimilarity, similarity);
  }
  
  // Estimate distance based on similarity
  let distance: 'very_close' | 'close' | 'medium' | 'far';
  if (maxSimilarity > 0.85) distance = 'very_close';
  else if (maxSimilarity > 0.70) distance = 'close';
  else if (maxSimilarity > 0.55) distance = 'medium';
  else distance = 'far';
  
  return {
    similarity: maxSimilarity,
    distance,
    confidence: maxSimilarity
  };
}

/**
 * Create visual signature from ImageData
 */
export function createSignature(imageData: ImageData): VisualSignature {
  return {
    phash: computePerceptualHash(imageData),
    keypoints: extractKeypoints(imageData, 20),
    width: imageData.width,
    height: imageData.height,
    timestamp: Date.now()
  };
}

// Helper: Resize and convert to grayscale
function resizeAndGrayscale(imageData: ImageData, targetSize: number): Float32Array {
  const { width, height, data } = imageData;
  const gray = new Float32Array(targetSize * targetSize);
  
  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const srcX = Math.floor((x / targetSize) * width);
      const srcY = Math.floor((y / targetSize) * height);
      const srcIdx = (srcY * width + srcX) * 4;
      
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      
      gray[y * targetSize + x] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
  }
  
  return gray;
}

// Helper: Simple 2D DCT (Discrete Cosine Transform)
function applyDCT(gray: Float32Array, size: number): Float32Array {
  const dct = new Float32Array(size * size);
  const pi = Math.PI;
  
  for (let v = 0; v < size; v++) {
    for (let u = 0; u < size; u++) {
      let sum = 0;
      
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const cos1 = Math.cos(((2 * x + 1) * u * pi) / (2 * size));
          const cos2 = Math.cos(((2 * y + 1) * v * pi) / (2 * size));
          sum += gray[y * size + x] * cos1 * cos2;
        }
      }
      
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      dct[v * size + u] = (cu * cv * sum) / 4;
    }
  }
  
  return dct;
}
