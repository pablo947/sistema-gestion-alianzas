import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Filter, X, Loader2, Download, FileBarChart, DollarSign, Users, Network } from 'lucide-react';
import { ModuleStatsPanel } from '@/components/ModuleStatsPanel';

export interface ProjectsFiltersState {
  ejeEstrategico: string[];
  proyecto: string[];
  actor: string[];
  anio: number[];
}

interface Props {
  filters: ProjectsFiltersState;
  onFilterChange: (type: keyof ProjectsFiltersState, value: string | number) => void;
  onFilterRemove: (type: keyof ProjectsFiltersState, value: string | number) => void;
  ejes: string[];
  projects: Array<{ programa_id: string; nombre: string }>;
  actors: Array<{ actor_id: string; nombre_actor: string }>;
  filteredCount: number;
  totalProjects: number;
  isLoading: boolean;
  hasError: boolean;
  lastUpdatedAt?: string | null;
  lastUpdatedBy?: string | null;
  onExportIndicators: () => void;
  onExportBudget: () => void;
  onExportActors: () => void;
  onExportSynergy: () => void;
}

const YEARS = Array.from({ length: 2026 - 2018 + 1 }, (_, i) => 2018 + i);

export const ProjectsAdvancedFilters: React.FC<Props> = ({
  filters,
  onFilterChange,
  onFilterRemove,
  ejes,
  projects,
  actors,
  filteredCount,
  totalProjects,
  isLoading,
  hasError,
  lastUpdatedAt,
  lastUpdatedBy,
  onExportIndicators,
  onExportBudget,
  onExportActors,
  onExportSynergy,
}) => {
  const hasActiveFilters =
    filters.ejeEstrategico.length > 0 ||
    filters.proyecto.length > 0 ||
    filters.actor.length > 0 ||
    filters.anio.length > 0;

  const exportsDisabled = !hasActiveFilters || isLoading || hasError || filteredCount === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros Avanzados de Proyectos e Iniciativas
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando datos...
                </>
              ) : hasError ? (
                <span className="text-destructive">Error al cargar datos</span>
              ) : (
                <span className="text-green-600">
                  {filteredCount} proyecto{filteredCount !== 1 ? 's' : ''} encontrado{filteredCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ModuleStatsPanel
          totalCount={totalProjects}
          label="proyectos registrados"
          lastUpdatedAt={lastUpdatedAt}
          lastUpdatedBy={lastUpdatedBy}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Eje Estratégico */}
          <div className="space-y-2">
            <Label>Eje Estratégico</Label>
            <Select onValueChange={(v) => !filters.ejeEstrategico.includes(v) && onFilterChange('ejeEstrategico', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar eje" />
              </SelectTrigger>
              <SelectContent>
                {ejes.length === 0 ? (
                  <SelectItem value="__none__" disabled>Sin ejes registrados</SelectItem>
                ) : (
                  ejes.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.ejeEstrategico.map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => onFilterRemove('ejeEstrategico', item)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Proyecto */}
          <div className="space-y-2">
            <Label>Proyecto / Iniciativa</Label>
            <Select onValueChange={(v) => !filters.proyecto.includes(v) && onFilterChange('proyecto', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Buscar proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.programa_id} value={p.programa_id}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.proyecto.map(id => {
                const p = projects.find(pp => pp.programa_id === id);
                return (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {p?.nombre || id}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => onFilterRemove('proyecto', id)} />
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Actor Relacionado */}
          <div className="space-y-2">
            <Label>Actor Relacionado</Label>
            <Select onValueChange={(v) => !filters.actor.includes(v) && onFilterChange('actor', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar actor" />
              </SelectTrigger>
              <SelectContent>
                {actors.map(a => (
                  <SelectItem key={a.actor_id} value={a.actor_id}>{a.nombre_actor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.actor.map(id => {
                const a = actors.find(aa => aa.actor_id === id);
                return (
                  <Badge key={id} variant="secondary" className="text-xs">
                    {a?.nombre_actor || id}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => onFilterRemove('actor', id)} />
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Año Alianza */}
          <div className="space-y-2">
            <Label>Año de Alianza Activa</Label>
            <Select onValueChange={(v) => {
              const n = Number(v);
              if (!filters.anio.includes(n)) onFilterChange('anio', n);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.anio.map(y => (
                <Badge key={y} variant="secondary" className="text-xs">
                  {y}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => onFilterRemove('anio', y)} />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Download className="h-4 w-4" />
            Descargas Especializadas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" disabled={exportsDisabled} onClick={onExportIndicators} className="justify-start">
              <FileBarChart className="mr-2 h-4 w-4" />
              Indicadores por Proyecto
            </Button>
            <Button variant="outline" disabled={exportsDisabled} onClick={onExportBudget} className="justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Ejecución Presupuestal
            </Button>
            <Button variant="outline" disabled={exportsDisabled} onClick={onExportActors} className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Actores Atados a Proyectos
            </Button>
            <Button variant="outline" disabled={exportsDisabled} onClick={onExportSynergy} className="justify-start">
              <Network className="mr-2 h-4 w-4" />
              Sinergia de Actores
            </Button>
          </div>
          {!hasActiveFilters && (
            <p className="text-xs text-muted-foreground">
              Aplica al menos un filtro para habilitar las descargas.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
