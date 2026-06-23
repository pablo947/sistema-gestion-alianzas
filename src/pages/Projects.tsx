
import React, { useState, useMemo } from "react";
import { fuzzyMatch, fuzzyMatchAll } from '@/lib/textUtils';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Target, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";
import { Project } from "@/components/projects/types";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from '@/components/layout/PageHeader';

import { EJES, EJE_BADGE_CLASS, normalizeEje } from "@/lib/ejes";

const EJES_ESTRATEGICOS = EJES;

const STATUS_COLORS: Record<string, string> = {
  "Ejecución": "bg-green-500/10 text-green-700 border-green-200",
  "Finalizado": "bg-blue-500/10 text-blue-700 border-blue-200",
  "Planificado": "bg-yellow-500/10 text-yellow-700 border-yellow-200",
};


export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<any>(null);
  const [filters, setFilters] = useState({
    estado: searchParams.get('estado') || '',
    area: searchParams.get('area') || ''
  });
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { canEditProjects } = usePermissions();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (filters.estado) newSearchParams.set('estado', filters.estado);
    if (filters.area) newSearchParams.set('area', filters.area);
    setSearchParams(newSearchParams);
  }, [filters, setSearchParams]);

  const { data: projects = [], isLoading } = useQuery<any[]>({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('programs')
        .select(`
          programa_id,
          nombre,
          objetivos,
          eje_estrategico,
          estado,
          fecha_inicio,
          fecha_cierre,
          presupuesto_total,
          presupuesto_ejecutado,
          metas,
          created_at,
          actor_programs (
            actor_id,
            actors (
              actor_id,
              nombre_actor,
              sector_actor,
              tipo_relacion,
              ciudad_sede,
              nivel_influencia,
              nivel_interes
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as any[]) || [];
    },
  });

  const uniqueStatus = useMemo(() => {
    if (!projects) return [];
    return projects
      .map((p: any) => p.estado)
      .filter(Boolean)
      .filter((s: any, i: number, a: any[]) => a.indexOf(s) === i)
      .sort();
  }, [projects]);

  const deleteMutation = useMutation({
    mutationFn: async (programaId: string) => {
      const { error } = await (supabase as any).from('programs').delete().eq('programa_id', programaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast({ title: "Programa eliminado", description: "El programa ha sido eliminado exitosamente." });
      setProjectToDelete(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Hubo un error al eliminar el programa.", variant: "destructive" });
    }
  });

  const filteredProjects = projects.filter((project: any) => {
    const projectActors = project.actor_programs?.map((ap: any) => ap.actors?.nombre_actor).filter(Boolean) || [];
    const ejeEstrategico = normalizeEje(project.eje_estrategico) || "";

    const matchesSearch = fuzzyMatchAll(
      [project.nombre, ejeEstrategico, project.objetivos, ...projectActors],
      searchTerm
    );
    const matchesStatus = filters.estado === '' || project.estado === filters.estado;
    const matchesArea = filters.area === '' || ejeEstrategico === filters.area;
    return matchesSearch && matchesStatus && matchesArea;
  });

  const hasActiveFilters = filters.estado || filters.area || searchTerm;

  const clearAllFilters = () => {
    setFilters({ estado: '', area: '' });
    setSearchTerm('');
    setSearchParams(new URLSearchParams());
  };

  const handleEdit = (project: any) => {
    setSelectedProject(project as Project);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedProject(null);
    setIsDialogOpen(true);
  };

  const handleCardClick = (project: any) => {
    setDetailProject(project);
  };

  const handleEditFromDetail = () => {
    setDetailProject(null);
    handleEdit(detailProject);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Programas e Iniciativas"
          description="Gestiona los programas e iniciativas de la fundación"
        />
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Programas e Iniciativas"
        description="Gestiona los programas e iniciativas de la fundación"
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar programas e iniciativas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button onClick={clearAllFilters} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
            {canEditProjects() && (
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Programa / Iniciativa
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Select value={filters.estado} onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Estado del programa" />
            </SelectTrigger>
            <SelectContent>
              {uniqueStatus.map((estado) => (
                <SelectItem key={estado} value={estado}>{estado}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.area} onValueChange={(value) => setFilters(prev => ({ ...prev, area: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Eje Estratégico" />
            </SelectTrigger>
            <SelectContent>
              {EJES_ESTRATEGICOS.map((eje) => (
                <SelectItem key={eje} value={eje}>{eje}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="text-sm text-muted-foreground">
            {filteredProjects.length} programa{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay programas e iniciativas</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || hasActiveFilters ? "No se encontraron programas con ese criterio de búsqueda." : "Comienza creando tu primer programa o iniciativa."}
          </p>
          {!searchTerm && !hasActiveFilters && canEditProjects() && (
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primer Programa / Iniciativa
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project: any) => {
            const indicators: any[] = Array.isArray(project.metas) ? project.metas : [];
            const projectActors = project.actor_programs?.map((ap: any) => ap.actors).filter(Boolean) || [];
            const overallProgress = indicators.length > 0
              ? Math.round(
                  indicators.reduce((sum: number, ind: any) => {
                    const meta = parseFloat(ind.meta) || 0;
                    const avance = ind.avance || 0;
                    return sum + (meta > 0 ? Math.min((avance / meta) * 100, 100) : 0);
                  }, 0) / indicators.length
                )
              : 0;

            return (
              <Card
                key={project.programa_id}
                className="group cursor-pointer border hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-card"
                onClick={() => handleCardClick(project)}
              >
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {project.nombre}
                    </h3>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {(() => {
                        const eje = normalizeEje(project.eje_estrategico);
                        return eje ? (
                          <Badge className={EJE_BADGE_CLASS[eje] || "bg-muted text-muted-foreground"}>
                            {eje}
                          </Badge>
                        ) : null;
                      })()}

                      <Badge className={STATUS_COLORS[project.estado || 'Planificado'] || "bg-muted text-muted-foreground"}>
                        {project.estado || 'Planificado'}
                      </Badge>
                    </div>
                  </div>

                  {projectActors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                        {projectActors.slice(0, 3).map((actor: any) => (
                          <span key={actor.actor_id} className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {actor.nombre_actor}
                          </span>
                        ))}
                        {projectActors.length > 3 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            +{projectActors.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Avance general</span>
                      <span className="font-semibold text-foreground">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProjectDetailView
        open={!!detailProject}
        onOpenChange={(open) => { if (!open) setDetailProject(null); }}
        project={detailProject}
        isAdmin={isAdmin}
        canEdit={canEditProjects()}
        onEdit={handleEditFromDetail}
      />

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={selectedProject}
        onSuccess={() => setSelectedProject(null)}
      />

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el programa
              "{projectToDelete?.nombre}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && deleteMutation.mutate((projectToDelete as any).programa_id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
