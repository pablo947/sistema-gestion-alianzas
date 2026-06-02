DELETE FROM public.sna_metrics;
UPDATE public.actors SET importance_sna = NULL, importance_internal = NULL, importance_index = NULL, importance_updated_at = NULL;