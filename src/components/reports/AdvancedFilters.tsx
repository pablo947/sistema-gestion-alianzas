
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Download, Filter, X, Loader2, UserX, Target, Building2 } from "lucide-react";
import { SECTOR_OPTIONS } from "@/components/actors/constants";
import { EJES } from "@/lib/ejes";

interface AdvancedFiltersProps {
  onDownloadFiltered: () => void;
  isLoading: boolean;
  projects: any[];
  actors: any[];
  activeMunicipios: string[];
  filters: {
    municipio: string[];
    tipoRelacion: string[];
    proyecto: string[];
    actor: string[];
    eje: string[];
    sector: string[];
    sinContactos: boolean;
    estrategia: string[];
  };
  onFilterChange: (type: string, value: string) => void;
  onFilterRemove: (type: string, value: string) => void;
  filteredDataCount: number;
  hasError: boolean;
  onSinContactosChange: (value: boolean) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onDownloadFiltered,
  isLoading,
  projects,
  actors,
  activeMunicipios,
  filters,
  onFilterChange,
  onFilterRemove,
  filteredDataCount,
  hasError,
  onSinContactosChange
}) => {

  const tiposRelacion = [
    'Beneficiario',
    'Co-gestor',
    'Co-Implementador',
    'Donante',
    'Membresía',
    'Prospecto'
  ];


  const estrategiaOptions = [
    { value: 'Gestionar de Cerca', color: 'bg-green-500', label: 'Gestionar de Cerca' },
    { value: 'Mantener Satisfechos', color: 'bg-orange-500', label: 'Mantener Satisfechos' },
    { value: 'Mantener Informados', color: 'bg-blue-500', label: 'Mantener Informados' },
    { value: 'Monitorear', color: 'bg-gray-500', label: 'Monitorear' }
  ];

  const addFilter = (type: keyof typeof filters, value: string) => {
    if (filters && filters[type]) {
      const filterValue = filters[type];
      if (Array.isArray(filterValue) && !filterValue.includes(value)) {
        onFilterChange(type, value);
      }
    }
  };

  const removeFilter = (type: keyof typeof filters, value: string) => {
    onFilterRemove(type, value);
  };

  const hasActiveFilters = filters ? (
    Object.entries(filters).some(([key, value]) => {
      if (key === 'sinContactos') return value === true;
      return Array.isArray(value) && value.length > 0;
    })
  ) : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros Avanzados de Actores
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
                  {filteredDataCount} registro{filteredDataCount !== 1 ? 's' : ''} encontrado{filteredDataCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtro especial de actores sin contactos */}
        <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 bg-primary/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <UserX className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <Label htmlFor="sin-contactos" className="text-base font-semibold">
                  Solo actores sin contactos asociados
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Filtrar actores que no tienen contactos registrados
                </p>
              </div>
            </div>
            <Switch
              id="sin-contactos"
              checked={filters?.sinContactos || false}
              onCheckedChange={onSinContactosChange}
            />
          </div>
          {filters?.sinContactos && (
            <Badge variant="default" className="mt-3">
              Filtro activo: Sin contactos
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Sector
            </Label>
            <Select onValueChange={(value) => addFilter('sector', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTOR_OPTIONS.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {(filters?.sector || []).map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter('sector', item)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Municipio</Label>
            <Select onValueChange={(value) => addFilter('municipio', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar municipio" />
              </SelectTrigger>
              <SelectContent>
                {activeMunicipios.map(municipio => (
                  <SelectItem key={municipio} value={municipio}>
                    {municipio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {(filters?.municipio || []).map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('municipio', item)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Relación</Label>
            <Select onValueChange={(value) => addFilter('tipoRelacion', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de relación" />
              </SelectTrigger>
              <SelectContent>
                {tiposRelacion.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {(filters?.tipoRelacion || []).map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => removeFilter('tipoRelacion', item)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eje</Label>
            <Select onValueChange={(value) => addFilter('eje', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar eje" />
              </SelectTrigger>
              <SelectContent>
                {EJES.map(eje => (
                  <SelectItem key={eje} value={eje}>
                    {eje}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {(filters?.eje || []).map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter('eje', item)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Proyecto</Label>
            <Select onValueChange={(value) => addFilter('proyecto', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.programa_id} value={project.programa_id}>
                    {project.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {(filters?.proyecto || []).map(item => {
                const project = projects.find(p => p.programa_id === item);
                return (
                  <Badge key={item} variant="secondary" className="text-xs">
                    {project?.nombre || item}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('proyecto', item)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Actor</Label>
            <Select onValueChange={(value) => addFilter('actor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar actor" />
              </SelectTrigger>
              <SelectContent>
                {actors.map(actor => (
                  <SelectItem key={actor.actor_id} value={actor.actor_id}>
                    {actor.nombre_actor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {(filters?.actor || []).map(item => {
                const actor = actors.find(a => a.actor_id === item);
                return (
                  <Badge key={item} variant="secondary" className="text-xs">
                    {actor?.nombre_actor || item}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('actor', item)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Estrategia (Matriz Influencia-Interés)
            </Label>
            <Select onValueChange={(value) => addFilter('estrategia', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estrategia" />
              </SelectTrigger>
              <SelectContent>
                {estrategiaOptions.map(estrategia => (
                  <SelectItem key={estrategia.value} value={estrategia.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${estrategia.color}`} />
                      {estrategia.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {(filters?.estrategia || []).map(item => {
                const estrategia = estrategiaOptions.find(e => e.value === item);
                return (
                  <Badge key={item} variant="secondary" className="text-xs flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${estrategia?.color}`} />
                    {item}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => removeFilter('estrategia', item)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <Button 
          onClick={onDownloadFiltered}
          disabled={!hasActiveFilters || isLoading || hasError || filteredDataCount === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando datos...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {filteredDataCount === 0 && hasActiveFilters ? 'Sin datos para descargar' : 'Descargar Reporte Filtrado'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
