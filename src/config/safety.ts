/**
 * SAFETY THRESHOLDS AND PERFORMANCE TARGETS
 * Production-grade constants for ML inference
 */

export const SAFETY = {
  // Object detection
  MIN_DETR_SCORE: 0.35,          // drop low-confidence boxes
  CENTER_LANE_BAND: 0.34,        // center = mid 34% of screen
  NEAR_AREA_RATIO: 0.12,         // bbox area / frame area >= near
  MID_AREA_RATIO: 0.04,          // ... >= mid else far

  // Embedding search
  MIN_ITEM_COSINE: 0.78,         // item similarity threshold
  TOPK_ITEM_CANDIDATES: 5,       // check top-K DETR boxes by score

  // Loop & performance
  TARGET_FRAME_MS: 120,          // <=120ms/frame
  MAX_CONCURRENT_INFER: 1,       // backpressure

  // Miss trend (crude FN proxy)
  MAX_SILENT_FRAMES_WARN: 90,    // ~10s at 9fps
};
