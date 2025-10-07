/**
 * Lightweight telemetry for ML performance tracking
 */

const hist: Record<string, number[]> = {};

export function tObserve(name: string, value: number, cap = 128) {
  if (!hist[name]) hist[name] = [];
  const arr = hist[name]; 
  arr.push(value); 
  if (arr.length > cap) arr.shift();
}

export function tSummary(name: string) {
  const arr = hist[name] || [];
  if (!arr.length) return { p95: 0, avg: 0, n: 0 };
  const sorted = [...arr].sort((a,b)=>a-b);
  const p95 = sorted[Math.max(0, Math.floor(0.95*(sorted.length-1)))];
  const avg = arr.reduce((s,x)=>s+x,0)/arr.length;
  return { p95, avg, n: arr.length };
}
