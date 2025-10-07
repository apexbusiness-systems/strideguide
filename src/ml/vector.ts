/**
 * Vector operations for embeddings
 */

export function cosineSim(a: Float32Array, b: Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i=0;i<n;i++){ 
    const x=a[i], y=b[i]; 
    dot+=x*y; 
    na+=x*x; 
    nb+=y*y; 
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}
