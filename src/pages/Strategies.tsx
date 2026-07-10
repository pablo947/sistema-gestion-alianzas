import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ImportanceIndexTab } from '@/components/strategies/ImportanceIndexTab';
import { usePermissions } from '@/hooks/usePermissions';
import { HeatMap } from '@/components/dashboard/HeatMap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useInfluenceInterest } from '@/hooks/useInfluenceInterest';
import { useActorRelations } from '@/hooks/useActorRelations';
import { PageHeader } from '@/components/layout/PageHeader';
import Grafos from './Grafos';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lightbulb, StickyNote } from 'lucide-react';
import { StrategicActionDialog } from '@/components/strategies/StrategicActionDialog';

const BAR_COLORS = ['#F59E0B', '#22C55E', '#1E3A5F', '#06B6D4', '#6366F1', '#EC4899', '#8B5CF6'];

interface StrategicAction {
  id: string;
  scope: 'quadrant' | 'actor';
  quadrant_key: string;
  actor_id: string | null;
  action_text: string;
}


interface ActorItem {
  actor_id: string;
  nombre_actor: string;
  nivel_influencia: number | null;
  nivel_interes: number | null;
  tipo_relacion: string[] | null;
}

interface ProgramInfo {
  programa_id: string;
  nombre: string;
  eje_estrategico: string | null;
}

const quadrants = [
  {
    key: 'satisfied',
    title: 'Mantener Satisfechos',
    description: 'Alta influencia, bajo interés',
    filter: (a: ActorItem) => (a.nivel_influencia || 0) >= 4 && (a.nivel_interes || 0) < 4,
    color: 'border-l-4 border-l-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
  {
    key: 'close',
    title: 'Gestionar de Cerca',
    description: 'Alta influencia, alto interés',
    filter: (a: ActorItem) => (a.nivel_influencia || 0) >= 4 && (a.nivel_interes || 0) >= 4,
    color: 'border-l-4 border-l-green-600',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    key: 'monitor',
    title: 'Monitorear',
    description: 'Baja influencia, bajo interés',
    filter: (a: ActorItem) => (a.nivel_influencia || 0) < 4 && (a.nivel_interes || 0) < 4,
    color: 'border-l-4 border-l-gray-600',
    bg: 'bg-gray-50 dark:bg-gray-950/20',
  },
  {
    key: 'informed',
    title: 'Mantener Informados',
    description: 'Baja influencia, alto interés',
    filter: (a: ActorItem) => (a.nivel_influencia || 0) < 4 && (a.nivel_interes || 0) >= 4,
    color: 'border-l-4 border-l-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
];

const allyTypes = [
  {
    key: 'Co-Implementador',
    title: 'Co-Implementador',
    definition: 'Organización que participa activamente en la ejecución conjunta de programas e iniciativas de la Fundacion Luker.',
    color: 'border-l-4 border-l-amber-500',
  },
  {
    key: 'Co-gestor',
    title: 'Co-gestor',
    definition: 'Entidad que comparte la gestión y coordinación de iniciativas estratégicas con la Fundacion Luker.',
    color: 'border-l-4 border-l-green-500',
  },
  {
    key: 'Donante',
    title: 'Donante',
    definition: 'Organización o entidad que aporta recursos financieros para el desarrollo de los programas.',
    color: 'border-l-4 border-l-blue-800',
  },
  {
    key: 'Beneficiario',
    title: 'Beneficiario',
    definition: 'Actor que recibe directamente los beneficios o servicios de los programas de la Fundacion Luker.',
    color: 'border-l-4 border-l-cyan-500',
  },
  {
    key: 'Membresía',
    title: 'Membresía',
    definition: 'Organización vinculada a través de una membresía formal o acuerdo de pertenencia.',
    color: 'border-l-4 border-l-indigo-500',
  },
  {
    key: 'Prospecto',
    title: 'Prospecto',
    definition: 'Organización identificada como potencial aliado con la que se exploran oportunidades de colaboración.',
    color: 'border-l-4 border-l-pink-500',
  },
];

export default function Strategies() {
  const navigate = useNavigate();
  const location = useLocation();
  const [actors, setActors] = useState<ActorItem[]>([]);
  const [programsByActor, setProgramsByActor] = useState<Record<string, ProgramInfo[]>>({});
  const [allyNotes, setAllyNotes] = useState<Record<string, string>>({});
  const [approvedActions, setApprovedActions] = useState<StrategicAction[]>([]);
  const { canEdit, canEditRecommendations } = usePermissions();
  const { data: influenceInterest } = useInfluenceInterest();
  const { data: relationsData } = useActorRelations();

  const pathParts = location.pathname.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  const validTabs = ['matriz', 'tipos', 'analisis-redes', 'importancia'];
  const activeTab = validTabs.includes(lastPart) ? lastPart : 'matriz';

  const handleTabChange = (value: string) => {
    navigate(`/clasificacion-aliados/${value}`);
  };

  useEffect(() => {
  const loadData = async () => {
    const [{ data: actorsData }, { data: linksData }, { data: programsData }, { data: actionsData }] = await Promise.all([
      supabase
        .from('actors')
        .select('actor_id, nombre_actor, nivel_influencia, nivel_interes, tipo_relacion'),
      supabase.from('actor_programs').select('actor_id, program_id'),
      supabase.from('programs').select('programa_id, nombre, eje_estrategico'),
      supabase.from('strategic_actions').select('*').eq('status', 'approved'),
    ]);

    if (actorsData) setActors(actorsData);
    if (actionsData) setApprovedActions(actionsData as StrategicAction[]);

      if (linksData && programsData) {
        const programMap = new Map<string, ProgramInfo>(
          programsData.map((p) => [p.programa_id, p])
        );
        const grouped: Record<string, ProgramInfo[]> = {};
        linksData.forEach((link) => {
          const program = programMap.get(link.program_id);
          if (!program) return;
          if (!grouped[link.actor_id]) grouped[link.actor_id] = [];
          // Avoid duplicates
          if (!grouped[link.actor_id].some((p) => p.programa_id === program.programa_id)) {
            grouped[link.actor_id].push(program);
          }
        });
        setProgramsByActor(grouped);
      }
    };
    loadData();
  }, []);

  const getActorsByRelation = (type: string) => {
    return actors.filter((a) => {
      if (!a.tipo_relacion) return false;
      return a.tipo_relacion.some((t) => t.toLowerCase().includes(type.toLowerCase()));
    });
  };

  const handleProgramClick = (programaId: string) => {
    navigate(`/projects?id=${programaId}`);
  };

  const renderActorWithHover = (actor: ActorItem, showLevels: boolean, actorActions: StrategicAction[] = []) => {
    const programs = programsByActor[actor.actor_id] || [];
    const count = programs.length;

    return (
      <HoverCard key={actor.actor_id} openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-medium truncate">{actor.nombre_actor}</span>
              {actorActions.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={(e) => e.stopPropagation()} className="text-primary hover:text-primary/80 transition-colors shrink-0">
                        <Lightbulb className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-xs">
                      {actorActions.map((act, i) => (
                        <p key={i} className="mb-1 last:mb-0 text-white">{act.action_text}</p>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {count > 0 && (
                <span className="shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-primary/10 text-primary">
                  {count}
                </span>
              )}
            </div>
            {showLevels && (
              <span className="text-muted-foreground shrink-0 ml-2">
                I:{actor.nivel_influencia || 0} / Int:{actor.nivel_interes || 0}
              </span>
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          className="w-80 p-0 rounded-lg shadow-lg border bg-card"
        >
          <div className="p-4 space-y-3">
            <div>
              <h4 className="font-bold text-sm text-foreground leading-tight">
                {actor.nombre_actor}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Participa en {count} {count === 1 ? 'programa' : 'programas'}
              </p>
            </div>

            {count === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                Sin programas vinculados todavía.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Programas e Iniciativas Vinculadas
                </p>
                {programs.map((p) => (
                  <button
                    key={p.programa_id}
                    onClick={() => handleProgramClick(p.programa_id)}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-md hover:bg-primary/5 transition-colors group"
                  >
                    <span className="font-medium text-foreground group-hover:text-primary">
                      {p.nombre}
                    </span>
                    {p.eje_estrategico && (
                      <span className="text-muted-foreground ml-1">
                        ({p.eje_estrategico})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader 
        title="Clasificación de Aliados"
        description="Estrategias de gestión y tipología de alianzas"
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full lg:max-w-4xl grid-cols-2 lg:grid-cols-4 mb-10 lg:mb-0">
          <TabsTrigger value="matriz" className="text-xs lg:text-sm">Matriz Interna</TabsTrigger>
          <TabsTrigger value="tipos" className="text-xs lg:text-sm">Tipos de Aliado</TabsTrigger>
          <TabsTrigger value="analisis-redes" className="text-xs lg:text-sm">Análisis de Redes y Relaciones</TabsTrigger>
          <TabsTrigger value="importancia" className="text-xs lg:text-sm">Índice de Importancia</TabsTrigger>
        </TabsList>


        {/* Section A: Influence/Interest Quadrants */}
        <TabsContent value="matriz" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Organización de actores según su nivel de influencia e interés para definir estrategias de relacionamiento.
          </p>
          
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Matriz Influencia–Interés</CardTitle>
            </CardHeader>
            <CardContent>
              <HeatMap data={influenceInterest || []} />
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {quadrants.map((q) => {
              const filtered = actors.filter(q.filter);
              const quadrantActions = approvedActions.filter(a => a.quadrant_key === q.key);
              const generalActions = quadrantActions.filter(a => a.scope === 'quadrant');
              const actorActions = quadrantActions.filter(a => a.scope === 'actor');

              return (
                <Card key={q.key} className={`${q.color} ${q.bg}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{q.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{q.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 max-h-44 overflow-y-auto custom-scrollbar">
                      {filtered.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">Sin actores en este cuadrante</p>
                      )}
                      {filtered.map((a) => {
                        const specificActions = actorActions.filter(act => act.actor_id === a.actor_id);
                        return renderActorWithHover(a, true, specificActions);
                      })}
                    </div>
                    
                    {generalActions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Acciones del Cuadrante
                        </p>
                        <ul className="space-y-1.5">
                          {generalActions.map((action) => (
                            <li key={action.id} className="text-xs text-foreground bg-background/50 p-2 rounded-md border border-border/30 flex items-start gap-2">
                              <StickyNote className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <span className="leading-tight">{action.action_text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {canEditRecommendations() && (
                      <div className="pt-2">
                        <StrategicActionDialog 
                          quadrantKey={q.key} 
                          quadrantTitle={q.title} 
                          actors={filtered} 
                          onSuccess={() => {
                            // En la vida real, se recargaría pero como está pending_approval no aparecerá inmediatamente.
                          }} 
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Section B: Ally Types */}
        <TabsContent value="tipos" className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Clasificación de organizaciones según el tipo de relación con la Fundación Luker.
          </p>

          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Relaciones de Actores</CardTitle>
            </CardHeader>
            <CardContent>
              {relationsData && relationsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={relationsData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Actores">
                      {relationsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                  Cargando datos...
                </div>
              )}
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {allyTypes.map((type) => {
              const matched = getActorsByRelation(type.key);
              return (
                <Card key={type.key} className={`${type.color}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{type.title}</CardTitle>
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {matched.length}
                      </span>
                    </div>
                    {/* Definition block */}
                    <div className="mt-2 p-2.5 rounded-md bg-muted/60 border border-border/50">
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                        {type.definition}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                      {matched.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">Sin organizaciones en esta categoría</p>
                      )}
                      {matched.map((a) => renderActorWithHover(a, false))}
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1 text-muted-foreground">Plan de Acción</p>
                      <Textarea
                        placeholder="Defina planes de acción para este tipo de aliado..."
                        value={allyNotes[type.key] || ''}
                        onChange={(e) => setAllyNotes({ ...allyNotes, [type.key]: e.target.value })}
                        className="text-xs min-h-[60px] resize-none"
                        disabled={!canEditRecommendations()}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Section C: Network Analysis */}
        <TabsContent value="analisis-redes" className="space-y-4">
          <Grafos />
        </TabsContent>

        {/* Section D: Composite Importance Index */}
        <TabsContent value="importancia" className="space-y-4">
          <ImportanceIndexTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

