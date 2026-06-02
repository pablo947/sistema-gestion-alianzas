import { useQuery } from '@tanstack/react-query';
import {
  computeBetweenness,
  computeDegrees,
  computePageRank,
  normalizeName,
  SnaLink,
  SnaNode,
} from '@/lib/snaCompute';

export type SnaLayer = 'relacionamiento' | 'reconocimiento' | 'recomendacion';

const ALLOWED_API_HOSTS = [
  'andesai-graph-api-production.up.railway.app',
  'andesai-graph-api.onrender.com',
];

const getApiBase = () => {
  const params = new URLSearchParams(window.location.search);
  let apiBase = (
    import.meta.env.VITE_API_BASE_URL ||
    'https://andesai-graph-api-production.up.railway.app'
  ).replace(/\/+$/, '');
  const requested = params.get('api');
  if (requested) {
    try {
      const url = new URL(requested);
      if (ALLOWED_API_HOSTS.includes(url.hostname)) {
        apiBase = requested.replace(/\/+$/, '');
      }
    } catch {}
  }
  return apiBase;
};

const doFetch = async (url: string) => {
  let res: Response;
  try {
    res = await fetch(url, {
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
  } catch (e: any) {
    throw new Error(`No se pudo conectar con la API de redes (${e?.message || 'network error'})`);
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API redes ${res.status}: ${txt.slice(0, 150)}`);
  }
  try {
    return await res.json();
  } catch {
    throw new Error(`API redes devolvió contenido no-JSON`);
  }
};

export interface SnaScore {
  grado: number;
  pagerank: number;
  betweenness: number;
}

export const useSnaFromGraph = (layer: SnaLayer) => {
  return useQuery({
    queryKey: ['sna-from-graph', layer],
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<{
      byNormName: Map<string, SnaScore>;
      totalNodes: number;
    }> => {
      const apiBase = getApiBase();
      let data = await doFetch(`${apiBase}/graph?layer=${encodeURIComponent(layer)}`);

      let nodes: SnaNode[] = data?.nodes || [];
      let rawLinks: any[] = data?.links || [];

      // Fallback igual a Grafos: si la respuesta filtrada viene vacía,
      // pedir el grafo completo y filtrar por link.layer en el cliente.
      if (nodes.length === 0 && rawLinks.length === 0) {
        data = await doFetch(`${apiBase}/graph`);
        const allNodes: SnaNode[] = data?.nodes || [];
        const allLinks: any[] = data?.links || [];
        rawLinks = allLinks.filter((l) => l?.layer === layer);
        const referenced = new Set<string>();
        rawLinks.forEach((l) => {
          referenced.add(String(l.source));
          referenced.add(String(l.target));
        });
        nodes = allNodes.filter((n) => referenced.has(String(n.id)));
      }

      const links: SnaLink[] = rawLinks.map((l) => ({
        source: String(l.source),
        target: String(l.target),
      }));

      const { inDegrees, outDegrees } = computeDegrees(nodes, links);
      const prMap = computePageRank(nodes, links);
      const btwMap = computeBetweenness(nodes, links);

      const byNormName = new Map<string, SnaScore>();
      nodes.forEach((n) => {
        const displayName = n.label || n.name || n.id;
        const key = normalizeName(displayName);
        if (!key) return;
        const grado =
          (inDegrees.get(n.id) || 0) + (outDegrees.get(n.id) || 0);
        byNormName.set(key, {
          grado,
          pagerank: prMap.get(n.id) || 0,
          betweenness: btwMap.get(n.id) || 0,
        });
      });

      return { byNormName, totalNodes: nodes.length };
    },
  });
};
