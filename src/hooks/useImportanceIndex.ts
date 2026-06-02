import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  computeScores,
  DEFAULT_WEIGHTS,
  ScoringWeights,
  ActorScoringInput,
} from '@/lib/importanceScoring';
import { useToast } from '@/hooks/use-toast';
import { useSnaFromGraph, SnaLayer } from '@/hooks/useSnaFromGraph';
import { normalizeName } from '@/lib/snaCompute';
import { useMemo } from 'react';

export const useScoringConfig = () => {
  return useQuery({
    queryKey: ['scoring_config'],
    queryFn: async (): Promise<ScoringWeights> => {
      const { data, error } = await supabase
        .from('scoring_config')
        .select('w_influencia, w_interes, w_grado, w_betweenness, w_pagerank')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_WEIGHTS;
      return {
        w_influencia: Number(data.w_influencia),
        w_interes: Number(data.w_interes),
        w_grado: Number(data.w_grado),
        w_betweenness: Number(data.w_betweenness),
        w_pagerank: Number(data.w_pagerank),
      };
    },
  });
};

// Trae actores + métricas SNA en vivo desde la API del módulo de Redes
// para la capa seleccionada. Empareja por nombre normalizado.
export const useImportanceData = (layer: SnaLayer) => {
  const snaQuery = useSnaFromGraph(layer);

  const actorsQuery = useQuery({
    queryKey: ['importance-actors-base'],
    queryFn: async () => {
      const [actorsRes, programsRes] = await Promise.all([
        supabase
          .from('actors')
          .select('actor_id, nombre_actor, nivel_influencia, nivel_interes')
          .order('nombre_actor'),
        supabase
          .from('actor_programs')
          .select('actor_id, programs(eje_estrategico)'),
      ]);
      if (actorsRes.error) throw actorsRes.error;

      const ejeMap = new Map<string, string>();
      (programsRes.data || []).forEach((ap: any) => {
        const eje = ap.programs?.eje_estrategico;
        if (eje && !ejeMap.has(ap.actor_id)) ejeMap.set(ap.actor_id, eje);
      });

      return { actors: actorsRes.data || [], ejeMap };
    },
  });

  const data = useMemo<{
    inputs: ActorScoringInput[];
    matched: number;
    total: number;
  } | undefined>(() => {
    if (!actorsQuery.data) return undefined;
    const snaByName = snaQuery.data?.byNormName ?? new Map();
    const { actors, ejeMap } = actorsQuery.data;
    let matched = 0;
    const inputs: ActorScoringInput[] = actors.map((a: any) => {
      const sna = snaByName.get(normalizeName(a.nombre_actor));
      if (sna) matched++;
      return {
        actor_id: a.actor_id,
        nombre_actor: a.nombre_actor,
        nivel_influencia: a.nivel_influencia,
        nivel_interes: a.nivel_interes,
        grado: sna?.grado ?? null,
        betweenness: sna?.betweenness ?? null,
        pagerank: sna?.pagerank ?? null,
        eje: ejeMap.get(a.actor_id) ?? null,
      };
    });
    return { inputs, matched, total: actors.length };
  }, [actorsQuery.data, snaQuery.data]);

  return {
    data,
    isLoading: actorsQuery.isLoading || snaQuery.isLoading,
    snaError: snaQuery.error as Error | null,
    snaLoading: snaQuery.isLoading,
    refetch: () => {
      actorsQuery.refetch();
      snaQuery.refetch();
    },
  };
};


export function useScoresWithWeights(
  inputs: ActorScoringInput[] | undefined,
  weights: ScoringWeights
) {
  if (!inputs) return [];
  return computeScores(inputs, weights);
}

export const useSaveScoring = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      weights,
      inputs,
    }: {
      weights: ScoringWeights;
      inputs: ActorScoringInput[];
    }) => {
      const scores = computeScores(inputs, weights);

      // Save weights (singleton update)
      const { error: cfgErr } = await supabase
        .from('scoring_config')
        .update({
          ...weights,
          updated_at: new Date().toISOString(),
        })
        .eq('singleton', true);
      if (cfgErr) throw cfgErr;

      // Persist scores per actor (batched)
      const now = new Date().toISOString();
      const updates = scores.map((s) =>
        supabase
          .from('actors')
          .update({
            importance_internal: s.internal_score,
            importance_sna: s.sna_score,
            importance_index: s.final_index,
            importance_updated_at: now,
          })
          .eq('actor_id', s.actor_id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      return scores.length;
    },
    onSuccess: (count) => {
      toast({
        title: 'Puntajes recalculados',
        description: `Se actualizaron ${count} actores.`,
      });
      qc.invalidateQueries({ queryKey: ['scoring_config'] });
      qc.invalidateQueries({ queryKey: ['actors-report'] });
      qc.invalidateQueries({ queryKey: ['actors'] });
    },
    onError: (e: any) => {
      toast({
        title: 'Error al guardar',
        description: e.message ?? 'No se pudieron persistir los puntajes',
        variant: 'destructive',
      });
    },
  });
};

