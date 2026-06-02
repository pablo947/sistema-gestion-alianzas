
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Users, Target, Edit, TrendingUp, ClipboardList, Eye, Heart, Radio, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IndicadorTecnico } from "./types";

type StrategyKey = "Gestionar de cerca" | "Mantener satisfechos" | "Mantener informados" | "Monitorear";

const STRATEGY_META: Record<StrategyKey, { icon: typeof Eye; dot: string; chip: string }> = {
  "Gestionar de cerca":   { icon: Heart,    dot: "bg-[#4CAF50]", chip: "border-[#4CAF50]/30 bg-[#4CAF50]/5 text-foreground" },
  "Mantener satisfechos": { icon: Activity, dot: "bg-[#FF9800]", chip: "border-[#FF9800]/30 bg-[#FF9800]/5 text-foreground" },
  "Mantener informados":  { icon: Radio,    dot: "bg-[#2196F3]", chip: "border-[#2196F3]/30 bg-[#2196F3]/5 text-foreground" },
  "Monitorear":           { icon: Eye,      dot: "bg-[#9E9E9E]", chip: "border-[#9E9E9E]/30 bg-[#9E9E9E]/5 text-foreground" },
};

const STRATEGY_ORDER: StrategyKey[] = [
  "Gestionar de cerca",
  "Mantener satisfechos",
  "Mantener informados",
  "Monitorear",
];

// Cruce con la matriz Influencia (y) - Interés (x). Alineado con get_influence_interest_data.
function getStrategyForActor(actor: any): StrategyKey {
  const x = Number(actor?.nivel_interes);
  const y = Number(actor?.nivel_influencia);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return "Monitorear";
  if (y >= 4 && x >= 4) return "Gestionar de cerca";
  if (y <= 2 && x >= 4) return "Mantener satisfechos";
  if (y >= 4 && x <= 2) return "Mantener informados";
  return "Monitorear";
}

interface ProjectDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  isAdmin: boolean;
  onEdit: () => void;
}

import { EJE_BADGE_CLASS as EJE_COLORS, normalizeEje } from "@/lib/ejes";


const STATUS_COLORS: Record<string, string> = {
  "Ejecución": "bg-green-500/10 text-green-700 border-green-200",
  "Finalizado": "bg-blue-500/10 text-blue-700 border-blue-200",
  "Planificado": "bg-yellow-500/10 text-yellow-700 border-yellow-200",
};

export function ProjectDetailView({ open, onOpenChange, project, isAdmin, onEdit }: ProjectDetailViewProps) {
  const navigate = useNavigate();
  if (!project) return null;

  const indicators: IndicadorTecnico[] = Array.isArray(project.metas) ? project.metas : [];
  const projectActors = project.actor_projects?.map((ap: any) => ap.actors).filter(Boolean) || [];

  // Cruce con matriz Influencia–Interés: agrupar actores por estrategia
  const actorsByStrategy: Record<StrategyKey, any[]> = {
    "Gestionar de cerca": [],
    "Mantener satisfechos": [],
    "Mantener informados": [],
    "Monitorear": [],
  };
  projectActors.forEach((a: any) => {
    actorsByStrategy[getStrategyForActor(a)].push(a);
  });
  Object.values(actorsByStrategy).forEach(list =>
    list.sort((a, b) => (a.nombre_actor || "").localeCompare(b.nombre_actor || "", "es"))
  );

  const handleActorClick = (actorId: string) => {
    onOpenChange(false);
    navigate(`/actors?actorId=${actorId}`);
  };
  const budgetPct = project.presupuesto_total > 0
    ? Math.round((project.presupuesto_ejecutado / project.presupuesto_total) * 100)
    : 0;

  const overallProgress = indicators.length > 0
    ? Math.round(
        indicators.reduce((sum, ind) => {
          const meta = parseFloat(ind.meta) || 0;
          const avance = ind.avance || 0;
          return sum + (meta > 0 ? Math.min((avance / meta) * 100, 100) : 0);
        }, 0) / indicators.length
      )
    : 0;

  const gestionIndicators = indicators.filter(i => i.tipo === "gestión");
  const resultadoIndicators = indicators.filter(i => i.tipo === "resultado");
  const impactoIndicators = indicators.filter(i => i.tipo === "impacto");

  const ejeEstrategico = normalizeEje(project.eje_estrategico) || "Sin clasificar";


  const getComplianceColor = (pct: number) => {
    if (pct >= 90) return "bg-green-500/10 text-green-700 border-green-200";
    if (pct >= 70) return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    if (pct >= 50) return "bg-orange-500/10 text-orange-700 border-orange-200";
    return "bg-red-500/10 text-red-700 border-red-200";
  };

  const renderIndicatorTable = (items: IndicadorTecnico[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No hay indicadores en esta categoría.
        </div>
      );
    }
    return (
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Código</TableHead>
              <TableHead className="min-w-[280px]">Indicador</TableHead>
              <TableHead className="w-[90px]">Meta</TableHead>
              <TableHead className="w-[90px]">Avance</TableHead>
              <TableHead className="w-[110px]">Cumplimiento</TableHead>
              <TableHead className="w-[110px]">Frecuencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((ind) => {
              const metaNum = parseFloat(ind.meta) || 0;
              const pct = metaNum > 0 ? Math.round((ind.avance / metaNum) * 100) : 0;
              return (
                <TableRow key={ind.id}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{ind.codigo}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-normal break-words text-sm">
                    {ind.indicador}
                  </TableCell>
                  <TableCell className="text-sm">{ind.meta}</TableCell>
                  <TableCell className="text-sm">{ind.avance}</TableCell>
                  <TableCell>
                    <Badge className={getComplianceColor(pct)}>{pct}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{ind.frecuencia_reporte}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  {project.nombre}
                </DialogTitle>
              </DialogHeader>
              <div className="flex gap-2 flex-wrap mt-3">
                <Badge className={STATUS_COLORS[project.estado] || "bg-muted text-muted-foreground"}>
                  {project.estado || "Planificado"}
                </Badge>
                <Badge className={EJE_COLORS[ejeEstrategico] || "bg-muted text-muted-foreground"}>
                  {ejeEstrategico}
                </Badge>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={onEdit} size="sm" className="shrink-0 mt-1">
                <Edit className="h-4 w-4 mr-2" />
                Editar Información
              </Button>
            )}
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {project.objetivos && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Objetivos</h3>
              <p className="text-sm text-foreground leading-relaxed">{project.objetivos}</p>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Periodo</span>
                </div>
                <p className="text-sm font-medium">
                  {project.fecha_inicio ? new Date(project.fecha_inicio).toLocaleDateString('es-ES') : "Sin definir"}
                  {" — "}
                  {project.fecha_cierre ? new Date(project.fecha_cierre).toLocaleDateString('es-ES') : "Sin definir"}
                </p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Presupuesto</span>
                </div>
                <p className="text-sm font-medium">
                  ${(project.presupuesto_ejecutado || 0).toLocaleString('es-ES')} / ${(project.presupuesto_total || 0).toLocaleString('es-ES')}
                </p>
                <Progress value={Math.min(budgetPct, 100)} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{budgetPct}% ejecutado</p>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Avance General</span>
                </div>
                <p className="text-2xl font-bold">{overallProgress}%</p>
                <Progress value={overallProgress} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{indicators.length} indicador{indicators.length !== 1 ? "es" : ""}</p>
              </CardContent>
            </Card>
          </div>

          {/* Actores Asociados — categorización por estrategia (matriz Influencia–Interés) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Actores Asociados
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {projectActors.length} {projectActors.length === 1 ? "actor" : "actores"}
              </span>
            </div>

            {projectActors.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Este proyecto aún no tiene actores asociados.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {STRATEGY_ORDER.map((strategy) => {
                  const list = actorsByStrategy[strategy];
                  const meta = STRATEGY_META[strategy];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={strategy}
                      className="rounded-lg border bg-card p-4 flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} aria-hidden />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-semibold text-foreground">{strategy}</h4>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {list.length}
                        </span>
                      </div>
                      {list.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          No hay actores en esta categoría para este proyecto.
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {list.map((actor: any) => (
                            <li key={actor.actor_id}>
                              <button
                                type="button"
                                onClick={() => handleActorClick(actor.actor_id)}
                                className="text-left text-sm text-foreground hover:text-primary hover:underline underline-offset-4 transition-colors w-full truncate"
                                title={`Ver ficha de ${actor.nombre_actor}`}
                              >
                                {actor.nombre_actor}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* Indicators Tabs - mirrors edit mode */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Indicadores Técnicos</h3>
            </div>
            <Tabs defaultValue="gestion" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="gestion" disabled={gestionIndicators.length === 0} className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Gestión ({gestionIndicators.length})
                </TabsTrigger>
                <TabsTrigger value="resultado" disabled={resultadoIndicators.length === 0} className="gap-2">
                  <Target className="h-4 w-4" />
                  Resultado ({resultadoIndicators.length})
                </TabsTrigger>
                <TabsTrigger value="impacto" disabled={impactoIndicators.length === 0} className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Impacto ({impactoIndicators.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="gestion">{renderIndicatorTable(gestionIndicators)}</TabsContent>
              <TabsContent value="resultado">{renderIndicatorTable(resultadoIndicators)}</TabsContent>
              <TabsContent value="impacto">{renderIndicatorTable(impactoIndicators)}</TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
