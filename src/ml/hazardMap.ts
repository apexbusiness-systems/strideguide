/**
 * COCO class → hazard type mapping
 * Lane and distance calculation from bounding boxes
 */

export type HazardType =
  | "vehicle" | "bike" | "dog" | "pole" | "bench" | "cone"
  | "wall" | "person" | "stair_like" | "dropoff_like" | "unknown";

export function cocoToHazard(className: string): HazardType {
  const c = className.toLowerCase();
  if (["car","bus","truck","train"].includes(c)) return "vehicle";
  if (["bicycle","motorcycle"].includes(c)) return "bike";
  if (["dog"].includes(c)) return "dog";
  if (["bench","chair"].includes(c)) return "bench";
  if (["traffic light","stop sign","fire hydrant","parking meter"].includes(c)) return "pole";
  if (["potted plant"].includes(c)) return "pole"; // vertical-ish obstacle
  if (["tv","microwave","refrigerator","book","vase"].includes(c)) return "unknown"; // indoor noise
  if (["backpack","handbag","suitcase"].includes(c)) return "dropoff_like"; // trip hazard proxy
  if (["bear","cow","horse","sheep","cat","bird"].includes(c)) return "unknown";
  if (["person"].includes(c)) return "person";
  return "unknown";
}

export type Lane = "left" | "center" | "right";
export type Distance = "near" | "mid" | "far";

export function laneOf(xCenter: number, width: number, band=0.34): Lane {
  const nx = xCenter / width; // 0..1
  const leftEdge = 0.5 - band/2;
  const rightEdge = 0.5 + band/2;
  if (nx < leftEdge) return "left";
  if (nx > rightEdge) return "right";
  return "center";
}

export function distanceOf(area: number, frameArea: number, near=0.12, mid=0.04): Distance {
  const r = area / frameArea;
  if (r >= near) return "near";
  if (r >= mid) return "mid";
  return "far";
}
