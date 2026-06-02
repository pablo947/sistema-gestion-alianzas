
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Download, Filter, X, Loader2, Building2 } from "lucide-react";
import { REDES_ALUMNI_OPTIONS, NIVELES_DIRECCION } from '@/components/contacts/types';
import { SECTOR_OPTIONS } from '@/components/actors/constants';

import { ModuleStatsPanel } from '@/components/ModuleStatsPanel';

interface ContactsAdvancedFiltersProps {
  onDownloadFiltered: () => void;
  isLoading: boolean;
  actors: Array<{ actor_id: string; nombre_actor: string }>;
  filters: {
    redAlumni: string[];
    equipo: string[];
    actor: string[];
    sector: string[];
    nivelDireccion: string[];
  };
  onFilterChange: (type: string, value: string) => void;
  onFilterRemove: (type: string, value: string) => void;
  filteredDataCount: number;
  hasError: boolean;
  totalContacts: number;
  lastUpdatedAt?: string | null;
  lastUpdatedBy?: string | null;
}

export const ContactsAdvancedFilters: React.FC<ContactsAdvancedFiltersProps> = ({
  onDownloadFiltered,
  isLoading,
  actors,
  filters,
  onFilterChange,
  onFilterRemove,
  filteredDataCount,
  hasError,
  totalContacts,
  lastUpdatedAt,
  lastUpdatedBy,
}) => {
  const addFilter = (type: string, value: string) => {
    const filterValue = filters[type as keyof typeof filters];
    if (Array.isArray(filterValue) && !filterValue.includes(value)) {
      onFilterChange(type, value);
    }
  };

  const removeFilter = (type: string, value: string) => {
    onFilterRemove(type, value);
  };

  const hasActiveFilters = Object.values(filters).some(
    v => Array.isArray(v) && v.length > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros Avanzados de Contactos
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
        <ModuleStatsPanel
          totalCount={totalContacts}
          label="contactos registrados"
          lastUpdatedAt={lastUpdatedAt}
          lastUpdatedBy={lastUpdatedBy}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sector */}
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
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {(filters.sector || []).map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFilter('sector', item)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Red Alumni */}
          <div className="space-y-2">
            <Label>Red Alumni</Label>
            <Select onValueChange={(value) => addFilter('redAlumni', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar red" />
              </SelectTrigger>
              <SelectContent>
                {REDES_ALUMNI_OPTIONS.map(red => (
                  <SelectItem key={red} value={red}>{red}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.redAlumni.map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFilter('redAlumni', item)} />
                </Badge>
              ))}
            </div>
          </div>


          {/* Actor Relacionado */}
          <div className="space-y-2">
            <Label>Actor Relacionado</Label>
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
              {filters.actor.map(item => {
                const actor = actors.find(a => a.actor_id === item);
                return (
                  <Badge key={item} variant="secondary" className="text-xs">
                    {actor?.nombre_actor || item}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFilter('actor', item)} />
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Nivel de dirección */}
          <div className="space-y-2">
            <Label>Nivel de dirección</Label>
            <Select onValueChange={(value) => addFilter('nivelDireccion', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                {NIVELES_DIRECCION.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {(filters.nivelDireccion || []).map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                  <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeFilter('nivelDireccion', item)} />
                </Badge>
              ))}
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
              {filteredDataCount === 0 && hasActiveFilters
                ? 'Sin datos para descargar'
                : 'Descargar Reporte de Contactos Filtrado'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
