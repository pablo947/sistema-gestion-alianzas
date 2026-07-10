import React, { useState, useMemo } from 'react';
import { fuzzyMatchAll, findDidYouMean } from '@/lib/textUtils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelectFilter } from '@/components/ui/multi-select-filter';
import { Plus, Search, Users, MapPin, Target, FolderOpen, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ActorDialog } from '@/components/actors/ActorDialog';
import { ActorDetailDialog } from '@/components/actors/ActorDetailDialog';
import { DidYouMean } from '@/components/DidYouMean';
import { RelatedContactsDialog } from '@/components/actors/RelatedContactsDialog';
import { Actor } from '@/components/actors/types';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ModuleStatsPanel } from '@/components/ModuleStatsPanel';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import {
  TIPO_RELACION_OPTIONS,
  MUNICIPIOS_POR_DEPARTAMENTO,
  SECTORES_BASE,
  ACADEMICO_SUBSECTORES,
} from '@/components/actors/constants';
import { EJES, normalizeEje } from '@/lib/ejes';
import { PageHeader } from '@/components/layout/PageHeader';


const ESTRATEGIAS_MATRIZ = [
  'Gestionar de cerca',
  'Mantener satisfechos',
  'Mantener informados',
  'Monitorear',
] as const;

const MUNICIPIOS_CALDAS = MUNICIPIOS_POR_DEPARTAMENTO['Caldas'] as readonly string[];

const getEstrategiaMatriz = (influencia?: number | null, interes?: number | null): string | null => {
  if (!influencia || !interes) return null;
  if (influencia >= 4 && interes >= 4) return 'Gestionar de cerca';
  if (influencia <= 2 && interes >= 4) return 'Mantener satisfechos';
  if (influencia >= 4 && interes <= 2) return 'Mantener informados';
  if (influencia <= 2 && interes <= 2) return 'Monitorear';
  if (influencia === 3 && interes >= 4) return 'Mantener satisfechos';
  if (influencia >= 4 && interes === 3) return 'Mantener informados';
  return 'Monitorear';
};

export default function Actors() {
  const { user } = useAuth();
  const { canEdit, canEditActors, canDeleteActors, canCreatePendingActors, canApproveRejectActors } = usePermissions();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showActorDialog, setShowActorDialog] = useState(false);
  const [showActorDetailDialog, setShowActorDetailDialog] = useState(false);
  const [selectedActor, setSelectedActor] = useState<any>(null);
  const [showContactsDialog, setShowContactsDialog] = useState(false);
  const [selectedActorForContacts, setSelectedActorForContacts] = useState<{ id: string; name: string } | null>(null);
  const [filters, setFilters] = useState({
    sector: [] as string[],
    tipoRelacion: [] as string[],
    sinContactos: '',
    ejeEstrategico: [] as string[],
    estrategiaMatriz: [] as string[],
    programa: [] as string[],
  });
  const [multiProgramOnly, setMultiProgramOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const queryClient = useQueryClient();

  // Sync URL params (tipoRelacion) with internal state
  React.useEffect(() => {
    const tipoRelacion = searchParams.get('tipoRelacion');
    if (tipoRelacion) setFilters(prev => ({ ...prev, tipoRelacion: [tipoRelacion] }));
  }, [searchParams]);

  const { data: actors, isLoading } = useQuery({
    queryKey: ['actors'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('actors')
        .select(`
          *,
          actor_programs (
            program_id,
            programs (
              programa_id,
              nombre,
              eje_estrategico,
              estado
            )
          ),
          contacts!left (contact_id)
        `)
        .order('nombre_actor');
      if (error) throw error;

      const actorsWithContactCount = (data as any[])?.map(actor => ({
        ...actor,
        contact_count: actor.contacts?.length || 0,
      })) || [];

      return actorsWithContactCount;
    },
  });

  const uniquePrograms = useMemo(() => {
    if (!actors) return [];
    const set = new Set<string>();
    actors.forEach(a =>
      a.actor_programs?.forEach((ap: any) => {
        const n = ap.programs?.nombre;
        if (n) set.add(n);
      })
    );
    return Array.from(set).sort();
  }, [actors]);

  React.useEffect(() => {
    const actorIdParam = searchParams.get('actorId');
    if (!actorIdParam || !actors) return;
    const target = actors.find((a: any) => a.actor_id === actorIdParam);
    if (target) {
      setSelectedActor(target);
      setShowActorDetailDialog(true);
      const next = new URLSearchParams(searchParams);
      next.delete('actorId');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, actors]);

  const { data: teamMembers = [] } = useTeamMembers();
  const getTeamMemberNames = (memberIds: string[]) => {
    if (!memberIds?.length) return [];
    return memberIds
      .map(id => teamMembers.find(m => m.id === id))
      .filter(Boolean)
      .map(m => `${m!.nombre} ${m!.apellidos}`);
  };

  const clearAllFilters = () => {
    setFilters({
      sector: [],
      tipoRelacion: [],
      sinContactos: '',
      ejeEstrategico: [],
      estrategiaMatriz: [],
      programa: [],
    });
    setSearchTerm('');
    setMultiProgramOnly(false);
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    Object.values(filters).some(v => (Array.isArray(v) ? v.length > 0 : v !== '')) || searchTerm.trim() !== '' || multiProgramOnly;

  const activeActors = (actors || []).filter(actor => actor.status !== 'pending_approval');
  const pendingActors = (actors || []).filter(actor => actor.status === 'pending_approval');

  const filteredActors = (activeTab === 'active' ? activeActors : pendingActors).filter(actor => {
    const matchesSearch = fuzzyMatchAll([actor.nombre_actor], searchTerm);
    const matchesSector = filters.sector.length === 0 || filters.sector.includes(actor.sector_actor);
    const matchesTipoRelacion = filters.tipoRelacion.length === 0 || (actor.tipo_relacion && (Array.isArray(actor.tipo_relacion) ? actor.tipo_relacion.some(r => filters.tipoRelacion.includes(r)) : filters.tipoRelacion.includes(actor.tipo_relacion)));
    const matchesSinContactos = filters.sinContactos === '' || (filters.sinContactos === 'sin_contactos' && actor.contact_count === 0) || (filters.sinContactos === 'con_contactos' && actor.contact_count > 0);
    const programs = (actor.actor_programs || []).map((ap: any) => ap.programs).filter(Boolean);
    const matchesEstrategia = filters.estrategiaMatriz.length === 0 || filters.estrategiaMatriz.includes(getEstrategiaMatriz(actor.nivel_influencia, actor.nivel_interes) || '');
    const matchesEje = filters.ejeEstrategico.length === 0 || programs.some((p: any) => { const eje = normalizeEje(p.eje_estrategico); return eje && filters.ejeEstrategico.includes(eje); });
    const matchesPrograma = filters.programa.length === 0 || programs.some((p: any) => filters.programa.includes(p.nombre));
    const matchesMultiProgram = !multiProgramOnly || programs.length > 1;

    return matchesSearch && matchesSector && matchesTipoRelacion && matchesSinContactos && matchesEstrategia && matchesEje && matchesPrograma && matchesMultiProgram;
  });

  const handleNewActor = () => {
    setSelectedActor(null);
    setShowActorDialog(true);
  };

  const handleViewActor = (actor: any) => {
    setSelectedActor(actor);
    setShowActorDetailDialog(true);
  };

  const handleEditFromDetail = () => {
    setShowActorDetailDialog(false);
    setShowActorDialog(true);
  };

  const handleShowContacts = (e: React.MouseEvent, actorId: string, actorName: string) => {
    e.stopPropagation();
    setSelectedActorForContacts({ id: actorId, name: actorName });
    setShowContactsDialog(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['actors'] });
    queryClient.invalidateQueries({ queryKey: ['actor-programs'] });
    setShowActorDialog(false);
    toast({ title: '¡Actor guardado!', description: '¡A celebrar con un café! ☕' });
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ actorId, status }: { actorId: string, status: string }) => {
      const { error } = await supabase.from('actors').update({ status }).eq('actor_id', actorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      toast({ title: 'Estado actualizado' });
    }
  });

  const lastUpdatedActor = useMemo(() => {
    if (!actors || actors.length === 0) return null;
    return [...actors].sort(
      (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
    )[0];
  }, [actors]);

  const didYouMeanSuggestion = useMemo(() => {
    if (!searchTerm.trim() || !actors || (filteredActors && filteredActors.length > 0)) return null;
    return findDidYouMean(searchTerm, actors.map(a => a.nombre_actor));
  }, [searchTerm, actors, filteredActors]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Actores"
        description="Gestiona los actores del ecosistema de la Fundación Luker"
        action={
          (canEditActors()) && (
            <Button onClick={handleNewActor} className="btn-animate">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Actor
            </Button>
          )
        }
      />

      <ModuleStatsPanel
        totalCount={activeActors.length}
        label="actores activos"
        lastUpdatedAt={lastUpdatedActor?.updated_at}
        lastUpdatedBy={user?.email ?? null}
      />

      {canApproveRejectActors() && pendingActors.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Actores Activos</TabsTrigger>
            <TabsTrigger value="pending">
              Solicitudes Pendientes
              <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                {pendingActors.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar actores..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {hasActiveFilters && (
            <Button onClick={clearAllFilters} variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
        {didYouMeanSuggestion && (
          <DidYouMean suggestion={didYouMeanSuggestion} onAccept={term => setSearchTerm(term)} />
        )}

        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <MultiSelectFilter
            title="Sector"
            options={[...SECTORES_BASE, ...ACADEMICO_SUBSECTORES.map(s => s.replace('Académico — ', ''))]}
            selectedValues={filters.sector}
            onValuesChange={(vals) => setFilters(prev => ({ ...prev, sector: vals }))}
          />
          <MultiSelectFilter
            title="Relación"
            options={TIPO_RELACION_OPTIONS as unknown as string[]}
            selectedValues={filters.tipoRelacion}
            onValuesChange={(vals) => setFilters(prev => ({ ...prev, tipoRelacion: vals }))}
          />
          <MultiSelectFilter
            title="Estrategia"
            options={ESTRATEGIAS_MATRIZ as unknown as string[]}
            selectedValues={filters.estrategiaMatriz}
            onValuesChange={(vals) => setFilters(prev => ({ ...prev, estrategiaMatriz: vals }))}
          />
          <MultiSelectFilter
            title="Eje"
            options={EJES as unknown as string[]}
            selectedValues={filters.ejeEstrategico}
            onValuesChange={(vals) => setFilters(prev => ({ ...prev, ejeEstrategico: vals }))}
          />
          <MultiSelectFilter
            title="Programa"
            options={uniquePrograms}
            selectedValues={filters.programa}
            onValuesChange={(vals) => setFilters(prev => ({ ...prev, programa: vals }))}
          />
          <Select
            value={filters.sinContactos}
            onValueChange={value => setFilters(prev => ({ ...prev, sinContactos: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Contactos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="con_contactos">Con contactos registrados</SelectItem>
              <SelectItem value="sin_contactos">Sin contactos registrados</SelectItem>
            </SelectContent>
          </Select>

        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="multi-program-switch"
              checked={multiProgramOnly}
              onCheckedChange={setMultiProgramOnly}
            />
            <Label htmlFor="multi-program-switch" className="text-sm cursor-pointer">
              Mostrar solo Actores en más de un programa
            </Label>
          </div>
          {hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              {filteredActors.length} actor{filteredActors.length !== 1 ? 'es' : ''} encontrado
              {filteredActors.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Listado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredActors.map(actor => {
          const actorPrograms = (actor.actor_programs || [])
            .map((ap: any) => ap.programs)
            .filter(Boolean);
          const responsableNames = getTeamMemberNames(actor.responsable_seguimiento || []);
          const programCount = actorPrograms.length;
          const estrategia = getEstrategiaMatriz(actor.nivel_influencia, actor.nivel_interes);

          return (
            <Card
              key={actor.actor_id}
              className="btn-animate cursor-pointer hover:shadow-md"
              onClick={() => handleViewActor(actor)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary dark:text-blue-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <HoverCard openDelay={150} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <CardTitle
                          className="text-lg truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          {actor.nombre_actor}
                          {programCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center text-[10px] font-medium bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-200 rounded-full px-1.5 py-0.5 align-middle">
                              {programCount}
                            </span>
                          )}
                        </CardTitle>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="right"
                        align="start"
                        className="w-80 rounded-lg shadow-lg border bg-popover"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="space-y-3">
                          <div>
                            <p className="font-bold text-sm leading-tight">{actor.nombre_actor}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Participa en {programCount} programa{programCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          {programCount > 0 ? (
                            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                              {actorPrograms.map((p: any) => (
                                <button
                                  key={p.programa_id}
                                  onClick={() => navigate(`/projects?id=${p.programa_id}`)}
                                  className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted transition-colors"
                                >
                                  <span className="font-medium text-foreground">{p.nombre}</span>
                                  {p.eje_estrategico && (
                                    <span className="text-muted-foreground"> ({p.eje_estrategico})</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Sin programas vinculados
                            </p>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    <p className="text-sm text-muted-foreground">{actor.sector_actor}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Alcance:</span>
                    <p className="text-muted-foreground">{actor.alcance_territorial || 'No especificado'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Ciudad Sede:</span>
                    <p className="text-muted-foreground">{actor.ciudad_sede || 'No especificada'}</p>
                  </div>
                  {(actor.municipio_actuacion?.length || actor.departamento_actuacion?.length) && (
                    <div className="col-span-2">
                      <span className="font-medium">Actuación:</span>
                      <p className="text-muted-foreground">
                        {[
                          Array.isArray(actor.municipio_actuacion) ? actor.municipio_actuacion.join(', ') : actor.municipio_actuacion,
                          Array.isArray(actor.departamento_actuacion) ? actor.departamento_actuacion.join(', ') : actor.departamento_actuacion,
                        ]
                          .filter(Boolean)
                          .join(' · ') || 'No especificada'}
                      </p>
                    </div>
                  )}
                </div>

                {actor.tipo_relacion?.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm flex-1">
                      <span className="font-medium">Relaciones:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(actor.tipo_relacion) ? actor.tipo_relacion.slice(0, 2).map((tipo: string) => (
                          <Badge key={tipo} variant="secondary" className="text-xs">{tipo}</Badge>
                        )) : (actor.tipo_relacion ? <Badge variant="secondary" className="text-xs">{actor.tipo_relacion}</Badge> : null)}
                        {Array.isArray(actor.tipo_relacion) && actor.tipo_relacion.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{actor.tipo_relacion.length - 2} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {estrategia && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium">Matriz:</span>
                      <Badge variant="outline" className="ml-2">{estrategia}</Badge>
                    </div>
                  </div>
                )}

                {actorPrograms.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <FolderOpen className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm flex-1">
                      <span className="font-medium">Programas:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {actorPrograms.slice(0, 2).map((p: any) => (
                          <Badge key={p.programa_id} variant="default" className="text-xs">
                            {p.nombre}
                          </Badge>
                        ))}
                        {actorPrograms.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{actorPrograms.length - 2} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {responsableNames.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm flex-1">
                      <span className="font-medium">Responsable:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {responsableNames.slice(0, 2).map((n, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{n}</Badge>
                        ))}
                        {responsableNames.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{responsableNames.length - 2} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  {activeTab === 'pending' && canApproveRejectActors() ? (
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatusMutation.mutate({ actorId: actor.actor_id, status: 'active' });
                        }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('¿Seguro que deseas rechazar y ocultar este actor?')) {
                            updateStatusMutation.mutate({ actorId: actor.actor_id, status: 'rejected' });
                          }
                        }}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Rechazar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={e => handleShowContacts(e, actor.actor_id, actor.nombre_actor)}
                      className="text-xs ml-auto"
                    >
                      <Contact className="mr-1 h-3 w-3" />
                      Contactos Relacionados
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredActors.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">
            {hasActiveFilters ? 'No se encontraron actores' : 'Buscar actores'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasActiveFilters
              ? 'No se encontraron actores con esos criterios.'
              : 'Usa la barra de búsqueda para encontrar actores específicos.'}
          </p>
          {!hasActiveFilters && canEditActors() && (
            <div className="mt-6">
              <Button onClick={handleNewActor} className="btn-animate">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Actor
              </Button>
            </div>
          )}
        </div>
      )}

      <ActorDetailDialog
        open={showActorDetailDialog}
        onOpenChange={setShowActorDetailDialog}
        actor={selectedActor}
        onEdit={handleEditFromDetail}
      />

      <ActorDialog
        open={showActorDialog}
        onOpenChange={setShowActorDialog}
        actor={selectedActor}
        onSuccess={handleSuccess}
      />

      <RelatedContactsDialog
        open={showContactsDialog}
        onOpenChange={setShowContactsDialog}
        actorId={selectedActorForContacts?.id || null}
        actorName={selectedActorForContacts?.name || ''}
      />
    </div>
  );
}
