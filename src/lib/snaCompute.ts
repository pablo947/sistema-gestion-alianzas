// Algoritmos SNA — copia fiel de los usados en src/pages/Grafos.tsx
// para garantizar consistencia entre el módulo de Redes y el Índice de Importancia.

export interface SnaNode {
  id: string;
  label?: string;
  name?: string;
}
export interface SnaLink {
  source: string;
  target: string;
}

export const computeDegrees = (nodes: SnaNode[], links: SnaLink[]) => {
  const outDegrees = new Map<string, number>();
  const inDegrees = new Map<string, number>();
  nodes.forEach((n) => {
    outDegrees.set(n.id, 0);
    inDegrees.set(n.id, 0);
  });
  links.forEach((l) => {
    outDegrees.set(l.source, (outDegrees.get(l.source) || 0) + 1);
    inDegrees.set(l.target, (inDegrees.get(l.target) || 0) + 1);
  });
  return { outDegrees, inDegrees };
};

export const computePageRank = (
  nodes: SnaNode[],
  links: SnaLink[],
  d = 0.85,
  maxIter = 40,
  tol = 1e-6,
) => {
  const N = nodes.length;
  const ids = nodes.map((n) => n.id);
  const idIndex = new Map(ids.map((id, i) => [id, i]));
  const outNeighbors: number[][] = Array.from({ length: N }, () => []);
  const outDeg = new Array(N).fill(0);
  for (const e of links) {
    const u = idIndex.get(e.source);
    const v = idIndex.get(e.target);
    if (u === undefined || v === undefined) continue;
    outNeighbors[u].push(v);
    outDeg[u]++;
  }
  let pr = new Array(N).fill(1 / N);
  let tmp = new Array(N).fill(0);
  for (let it = 0; it < maxIter; it++) {
    tmp.fill((1 - d) / N);
    let dangling = 0;
    for (let u = 0; u < N; u++) if (outDeg[u] === 0) dangling += pr[u];
    const addDangling = (d * dangling) / N;
    for (let u = 0; u < N; u++) {
      const share = outDeg[u] ? (d * pr[u]) / outDeg[u] : 0;
      for (const v of outNeighbors[u]) tmp[v] += share;
    }
    for (let i = 0; i < N; i++) tmp[i] += addDangling;
    let diff = 0;
    for (let i = 0; i < N; i++) diff += Math.abs(tmp[i] - pr[i]);
    pr = tmp.slice();
    if (diff < tol) break;
  }
  const out = new Map<string, number>();
  for (let i = 0; i < N; i++) out.set(ids[i], pr[i]);
  return out;
};

// Brandes (no dirigido)
export const computeBetweenness = (nodes: SnaNode[], links: SnaLink[]) => {
  const N = nodes.length;
  const ids = nodes.map((n) => n.id);
  const idIndex = new Map(ids.map((id, i) => [id, i]));
  const adj: number[][] = Array.from({ length: N }, () => []);
  for (const e of links) {
    const u = idIndex.get(e.source);
    const v = idIndex.get(e.target);
    if (u === undefined || v === undefined) continue;
    adj[u].push(v);
    adj[v].push(u);
  }
  const CB = new Array(N).fill(0);
  for (let s = 0; s < N; s++) {
    const S: number[] = [];
    const P: number[][] = Array.from({ length: N }, () => []);
    const sigma = new Array(N).fill(0);
    sigma[s] = 1;
    const dist = new Array(N).fill(-1);
    dist[s] = 0;
    const Q: number[] = [s];
    while (Q.length) {
      const v = Q.shift()!;
      S.push(v);
      for (const w of adj[v]) {
        if (dist[w] < 0) {
          dist[w] = dist[v] + 1;
          Q.push(w);
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          P[w].push(v);
        }
      }
    }
    const delta = new Array(N).fill(0);
    while (S.length) {
      const w = S.pop()!;
      for (const v of P[w]) delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      if (w !== s) CB[w] += delta[w];
    }
  }
  const norm = N > 2 ? 1 / (((N - 1) * (N - 2)) / 2) : 1;
  const out = new Map<string, number>();
  for (let i = 0; i < N; i++) out.set(ids[i], CB[i] * norm);
  return out;
};

export const normalizeName = (s: string) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
