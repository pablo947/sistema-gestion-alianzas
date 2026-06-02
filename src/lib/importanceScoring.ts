// Lógica pura del Índice de Importancia Compuesto
// Normaliza Matriz Interna (Influencia + Interés 1-5) y SNA (Grado, Intermediación, PageRank)
// a una escala 0-100 y pondera según los pesos configurables.

export interface ScoringWeights {
  w_influencia: number;
  w_interes: number;
  w_grado: number;
  w_betweenness: number;
  w_pagerank: number;
}

export interface ActorScoringInput {
  actor_id: string;
  nombre_actor: string;
  nivel_influencia: number | null;
  nivel_interes: number | null;
  grado: number | null;
  betweenness: number | null;
  pagerank: number | null;
  eje?: string | null;
}

export interface ActorScore {
  actor_id: string;
  nombre_actor: string;
  eje: string | null;
  internal_score: number; // 0-100
  sna_score: number; // 0-100
  final_index: number; // 0-100
  influencia_n: number;
  interes_n: number;
  grado_n: number;
  betweenness_n: number;
  pagerank_n: number;
  hasSna: boolean;
}

const normLikert = (v: number | null) => {
  if (v == null || isNaN(v)) return 0;
  const clamped = Math.max(1, Math.min(5, v));
  return ((clamped - 1) / 4) * 100;
};

const minMaxNormalize = (values: (number | null)[]): number[] => {
  const valid = values.filter((v): v is number => v != null && !isNaN(v));
  if (valid.length === 0) return values.map(() => 0);
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (max === min) return values.map((v) => (v == null ? 0 : 50));
  return values.map((v) => (v == null ? 0 : ((v - min) / (max - min)) * 100));
};

export const DEFAULT_WEIGHTS: ScoringWeights = {
  w_influencia: 20,
  w_interes: 20,
  w_grado: 20,
  w_betweenness: 20,
  w_pagerank: 20,
};

export function computeScores(
  actors: ActorScoringInput[],
  weights: ScoringWeights
): ActorScore[] {
  const gradoN = minMaxNormalize(actors.map((a) => a.grado));
  const betN = minMaxNormalize(actors.map((a) => a.betweenness));
  const prN = minMaxNormalize(actors.map((a) => a.pagerank));

  const wInternal = weights.w_influencia + weights.w_interes;
  const wSna = weights.w_grado + weights.w_betweenness + weights.w_pagerank;

  return actors.map((a, i) => {
    const inf = normLikert(a.nivel_influencia);
    const intr = normLikert(a.nivel_interes);
    const hasSna = (a.grado ?? 0) > 0 || (a.betweenness ?? 0) > 0 || (a.pagerank ?? 0) > 0;

    const internalNum =
      weights.w_influencia * inf + weights.w_interes * intr;
    const internal_score = wInternal > 0 ? internalNum / wInternal : 0;

    const snaNum =
      weights.w_grado * gradoN[i] +
      weights.w_betweenness * betN[i] +
      weights.w_pagerank * prN[i];
    const sna_score = wSna > 0 ? snaNum / wSna : 0;

    const totalW = wInternal + wSna;
    const final_index =
      totalW > 0 ? (internalNum + snaNum) / totalW : 0;

    return {
      actor_id: a.actor_id,
      nombre_actor: a.nombre_actor,
      eje: a.eje ?? null,
      internal_score: round1(internal_score),
      sna_score: round1(sna_score),
      final_index: round1(final_index),
      influencia_n: round1(inf),
      interes_n: round1(intr),
      grado_n: round1(gradoN[i]),
      betweenness_n: round1(betN[i]),
      pagerank_n: round1(prN[i]),
      hasSna,
    };
  });
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export const QUADRANTS = {
  estrategicos: {
    key: 'estrategicos',
    label: 'Aliados Estratégicos',
    description: 'Alto interno + alto SNA',
    color: 'hsl(142, 71%, 45%)',
  },
  gigantes: {
    key: 'gigantes',
    label: 'Gigantes Dormidos',
    description: 'Alto interno + bajo SNA',
    color: 'hsl(38, 92%, 50%)',
  },
  conectores: {
    key: 'conectores',
    label: 'Conectores Ocultos',
    description: 'Bajo interno + alto SNA',
    color: 'hsl(217, 91%, 60%)',
  },
  perifericos: {
    key: 'perifericos',
    label: 'Actores Periféricos',
    description: 'Bajo interno + bajo SNA',
    color: 'hsl(215, 16%, 47%)',
  },
} as const;

export function classifyQuadrant(s: ActorScore): keyof typeof QUADRANTS {
  const hi = s.internal_score >= 50;
  const hs = s.sna_score >= 50;
  if (hi && hs) return 'estrategicos';
  if (hi && !hs) return 'gigantes';
  if (!hi && hs) return 'conectores';
  return 'perifericos';
}
