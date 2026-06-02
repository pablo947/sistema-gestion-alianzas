
-- 1) SNA metrics per actor (manual import)
CREATE TABLE public.sna_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL UNIQUE,
  grado numeric NOT NULL DEFAULT 0,
  betweenness numeric NOT NULL DEFAULT 0,
  pagerank numeric NOT NULL DEFAULT 0,
  imported_at timestamptz NOT NULL DEFAULT now(),
  imported_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sna_metrics TO authenticated;
GRANT ALL ON public.sna_metrics TO service_role;

ALTER TABLE public.sna_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view sna_metrics"
  ON public.sna_metrics FOR SELECT TO authenticated USING (true);

CREATE POLICY "Write sna_metrics with permission"
  ON public.sna_metrics FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()) OR has_permission(auth.uid(), 'actors:write'));

CREATE POLICY "Update sna_metrics with permission"
  ON public.sna_metrics FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()) OR has_permission(auth.uid(), 'actors:write'));

CREATE POLICY "Delete sna_metrics admins"
  ON public.sna_metrics FOR DELETE TO authenticated
  USING (is_admin(auth.uid()));

CREATE TRIGGER trg_sna_metrics_updated
  BEFORE UPDATE ON public.sna_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Global scoring config (singleton)
CREATE TABLE public.scoring_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  w_influencia numeric NOT NULL DEFAULT 20,
  w_interes numeric NOT NULL DEFAULT 20,
  w_grado numeric NOT NULL DEFAULT 20,
  w_betweenness numeric NOT NULL DEFAULT 20,
  w_pagerank numeric NOT NULL DEFAULT 20,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE ON public.scoring_config TO authenticated;
GRANT ALL ON public.scoring_config TO service_role;

ALTER TABLE public.scoring_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view scoring_config"
  ON public.scoring_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert scoring_config"
  ON public.scoring_config FOR INSERT TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update scoring_config"
  ON public.scoring_config FOR UPDATE TO authenticated
  USING (is_admin(auth.uid()));

CREATE TRIGGER trg_scoring_config_updated
  BEFORE UPDATE ON public.scoring_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.scoring_config (singleton) VALUES (true);

-- 3) Persisted importance index per actor
ALTER TABLE public.actors
  ADD COLUMN IF NOT EXISTS importance_internal numeric,
  ADD COLUMN IF NOT EXISTS importance_sna numeric,
  ADD COLUMN IF NOT EXISTS importance_index numeric,
  ADD COLUMN IF NOT EXISTS importance_updated_at timestamptz;
