import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, Info, Network, AlertTriangle } from 'lucide-react';
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useScoringConfig,
  useImportanceData,
  useSaveScoring,
  useScoresWithWeights,
} from '@/hooks/useImportanceIndex';
import { SnaLayer } from '@/hooks/useSnaFromGraph';
import {
  DEFAULT_WEIGHTS,
  ScoringWeights,
  classifyQuadrant,
  QUADRANTS,
  ActorScore,
} from '@/lib/importanceScoring';
import { useToast } from '@/hooks/use-toast';

type WeightKey = keyof ScoringWeights;

const WEIGHT_LABELS: { key: WeightKey; label: string; group: 'interna' | 'sna' }[] = [
  { key: 'w_influencia', label: 'Influencia', group: 'interna' },
  { key: 'w_interes', label: 'Interés', group: 'interna' },
  { key: 'w_grado', label: 'Centralidad de Grado', group: 'sna' },
  { key: 'w_betweenness', label: 'Intermediación', group: 'sna' },
  { key: 'w_pagerank', label: 'PageRank', group: 'sna' },
];

const LAYER_OPTIONS: { value: SnaLayer; label: string }[] = [
  { value: 'relacionamiento', label: 'Relacionamiento' },
  { value: 'reconocimiento', label: 'Reconocimiento' },
  { value: 'recomendacion', label: 'Recomendación' },
];

export function ImportanceIndexTab() {
  const [layer, setLayer] = useState<SnaLayer>('relacionamiento');
  const { data: savedWeights } = useScoringConfig();
  const { data: importanceData, isLoading, snaError, snaLoading } = useImportanceData(layer);
  const save = useSaveScoring();
  const { toast } = useToast();

  const inputs = importanceData?.inputs;
  const matched = importanceData?.matched ?? 0;
  const total = importanceData?.total ?? 0;

  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [initialized, setInitialized] = useState(false);

  if (savedWeights && !initialized) {
    setWeights(savedWeights);
    setInitialized(true);
  }

  const scores = useScoresWithWeights(inputs, weights);
  const sorted = useMemo(
    () => [...scores].sort((a, b) => b.final_index - a.final_index),
    [scores]
  );

  const internalTotal = weights.w_influencia + weights.w_interes;
  const snaTotal = weights.w_grado + weights.w_betweenness + weights.w_pagerank;
  const weightTotal = internalTotal + snaTotal;

  const updateWeight = (k: WeightKey, v: number) =>
    setWeights((w) => ({ ...w, [k]: v }));

  const handleRecalc = () => {
    if (!inputs) return;
    if (weightTotal === 0) {
      toast({ title: 'Pesos inválidos', description: 'La suma no puede ser 0.', variant: 'destructive' });
      return;
    }
    save.mutate({ weights, inputs });
  };

  const handleReset = () => setWeights(DEFAULT_WEIGHTS);

  const exportXlsx = () => {
    const data = sorted.map((s, i) => ({
      '#': i + 1,
      'Aliado': s.nombre_actor,
      'Eje Asociado': s.eje || '—',
      'Puntaje Matriz Interna': s.internal_score,
      'Puntaje SNA': s.sna_score,
      'Índice de Importancia (0-100)': s.final_index,
      'Cuadrante': QUADRANTS[classifyQuadrant(s)].label,
      'Capa SNA': layer,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Índice de Importancia');
    XLSX.writeFile(wb, `indice_importancia_${layer}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header info */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            El <strong className="text-foreground">Índice de Importancia Compuesto</strong> cruza la Matriz Interna
            (Influencia + Interés) con las métricas SNA (Grado, Intermediación, PageRank)
            tomadas <strong className="text-foreground">en vivo</strong> desde la API del módulo de
            Análisis de Redes. Cambia la capa para recalcular con otra red.
          </p>
        </CardContent>
      </Card>

      {/* Control panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base">Panel de Control — Pesos del Algoritmo</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-muted-foreground" />
                <Select value={layer} onValueChange={(v) => setLayer(v as SnaLayer)}>
                  <SelectTrigger className="h-9 w-[180px] text-xs">
                    <SelectValue placeholder="Capa SNA" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">
                        Red: {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={exportXlsx} disabled={!sorted.length}>
                <Download className="w-4 h-4 mr-1.5" /> Exportar
              </Button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            {snaLoading ? (
              <span>Conectando con la API de redes…</span>
            ) : snaError ? (
              <span className="flex items-center gap-1.5 text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                No se pudo cargar la capa "{layer}": {snaError.message}
              </span>
            ) : (
              <span>
                <span className="font-medium text-foreground">{matched}</span> de{' '}
                <span className="font-medium text-foreground">{total}</span> actores con datos en la red de {layer}.
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Matriz Interna */}
            <div className="space-y-3 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Matriz Interna
                </h4>
                <Badge variant="secondary" className="text-xs">{internalTotal}%</Badge>
              </div>
              {WEIGHT_LABELS.filter((w) => w.group === 'interna').map((w) => (
                <WeightRow key={w.key} label={w.label} value={weights[w.key]} onChange={(v) => updateWeight(w.key, v)} />
              ))}
            </div>

            {/* SNA */}
            <div className="space-y-3 p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Social Network Analysis
                </h4>
                <Badge variant="secondary" className="text-xs">{snaTotal}%</Badge>
              </div>
              {WEIGHT_LABELS.filter((w) => w.group === 'sna').map((w) => (
                <WeightRow key={w.key} label={w.label} value={weights[w.key]} onChange={(v) => updateWeight(w.key, v)} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              Suma total: <span className="font-mono font-semibold text-foreground">{weightTotal}%</span>
              {weightTotal !== 100 && <span className="text-amber-600">(se normaliza automáticamente)</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset}>Restablecer</Button>
              <Button size="sm" onClick={handleRecalc} disabled={save.isPending || !inputs}>
                <RefreshCw className={`w-4 h-4 mr-1.5 ${save.isPending ? 'animate-spin' : ''}`} />
                Recalcular Puntajes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scatter plot */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Matriz de Cruce — Interna vs SNA</CardTitle>
          <p className="text-xs text-muted-foreground">
            Cada punto es un aliado. Los cuadrantes clasifican el rol estratégico.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            {Object.values(QUADRANTS).map((q) => (
              <div key={q.key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: q.color }} />
                <span className="font-medium">{q.label}</span>
                <span className="text-muted-foreground">— {q.description}</span>
              </div>
            ))}
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 36, left: 36 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="internal_score"
                  domain={[0, 100]}
                  name="Matriz Interna"
                  label={{ value: 'Puntaje Matriz Interna', position: 'insideBottom', offset: -16, fontSize: 12 }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="sna_score"
                  domain={[0, 100]}
                  name="SNA"
                  label={{ value: 'Puntaje SNA', angle: -90, position: 'insideLeft', offset: -20, fontSize: 12 }}
                  tick={{ fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="final_index" range={[60, 220]} />
                <ReferenceLine x={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as ActorScore;
                    return (
                      <div className="rounded-md border bg-background px-3 py-2 shadow-md text-xs">
                        <div className="font-semibold text-sm mb-1">{d.nombre_actor}</div>
                        <div>Interna: <span className="font-mono">{d.internal_score}</span></div>
                        <div>SNA: <span className="font-mono">{d.sna_score}</span></div>
                        <div className="font-semibold mt-1">Índice: <span className="font-mono">{d.final_index}</span></div>
                        <div className="text-muted-foreground mt-0.5">{QUADRANTS[classifyQuadrant(d)].label}</div>
                      </div>
                    );
                  }}
                />
                {Object.values(QUADRANTS).map((q) => (
                  <Scatter
                    key={q.key}
                    name={q.label}
                    data={scores.filter((s) => classifyQuadrant(s) === q.key)}
                    fill={q.color}
                    fillOpacity={0.75}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Results table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ranking de Aliados</CardTitle>
          <p className="text-xs text-muted-foreground">
            Ordenado por Índice de Importancia Final (mayor a menor). {sorted.length} actores.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Aliado</TableHead>
                  <TableHead>Eje Asociado</TableHead>
                  <TableHead className="text-right">Matriz Interna</TableHead>
                  <TableHead className="text-right">SNA</TableHead>
                  <TableHead className="text-right">Índice Final</TableHead>
                  <TableHead>Cuadrante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Cargando…</TableCell></TableRow>
                )}
                {!isLoading && sorted.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No hay actores.</TableCell></TableRow>
                )}
                {sorted.map((s, i) => {
                  const q = QUADRANTS[classifyQuadrant(s)];
                  return (
                    <TableRow key={s.actor_id}>
                      <TableCell className="text-muted-foreground font-mono text-xs">{i + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {s.nombre_actor}
                          {!s.hasSna && (
                            <TooltipProvider>
                              <UiTooltip>
                                <TooltipTrigger><Badge variant="outline" className="text-[9px] py-0 px-1">sin SNA</Badge></TooltipTrigger>
                                <TooltipContent>Sin métricas SNA importadas para este actor</TooltipContent>
                              </UiTooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.eje || '—'}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{s.internal_score}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{s.sna_score}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-semibold">{s.final_index}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-full" style={{ background: q.color }} />
                          {q.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WeightRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <Input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
          className="h-7 w-16 text-right text-xs font-mono"
        />
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
      />
    </div>
  );
}
