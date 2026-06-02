
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { TIPO_RELACION_OPTIONS } from "@/components/actors/constants";
import { useActiveMunicipios } from "@/hooks/useActiveMunicipios";

interface ReportFiltersProps {
  reportType: 'global' | 'individual';
  onReportTypeChange: (type: 'global' | 'individual') => void;
  selectedProject: string | null;
  onProjectChange: (projectId: string | null) => void;
  selectedActor: string | null;
  onActorChange: (actorId: string | null) => void;
  projects: Array<{ programa_id: string; nombre: string }>;
  actors: Array<{ actor_id: string; nombre_actor: string }>;
  exportFormat: 'docx' | 'markdown';
  onFormatChange: (format: 'docx' | 'markdown') => void;
  // Filtros avanzados
  selectedMunicipios: string[];
  onMunicipiosChange: (municipios: string[]) => void;
  selectedTipoRelacion: string[];
  onTipoRelacionChange: (tipos: string[]) => void;
  selectedProjects: string[];
  onProjectsChange: (projects: string[]) => void;
  selectedActors: string[];
  onActorsChange: (actors: string[]) => void;
  // Función para descarga filtrada
  onDownloadFiltered?: () => void;
  isLoadingFiltered?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  reportType,
  onReportTypeChange,
  selectedProject,
  onProjectChange,
  selectedActor,
  onActorChange,
  projects,
  actors,
  exportFormat,
  onFormatChange,
  selectedMunicipios,
  onMunicipiosChange,
  selectedTipoRelacion,
  onTipoRelacionChange,
  selectedProjects,
  onProjectsChange,
  selectedActors,
  onActorsChange,
  onDownloadFiltered,
  isLoadingFiltered = false
}) => {
  const { data: activeMunicipios = [], isLoading: isLoadingMunicipios } = useActiveMunicipios();

  const hasFiltersSelected = selectedMunicipios.length > 0 || 
                           selectedTipoRelacion.length > 0 || 
                           selectedProjects.length > 0 || 
                           selectedActors.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Reportes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Tipo de Reporte</Label>
          <RadioGroup 
            value={reportType} 
            onValueChange={(value) => onReportTypeChange(value as 'global' | 'individual')}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="global" id="global" />
              <Label htmlFor="global">Global (todos los registros)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual">Individual (registro específico)</Label>
            </div>
          </RadioGroup>
        </div>

        {reportType === 'individual' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Proyecto Específico</Label>
                <Select value={selectedProject || "none"} onValueChange={(value) => onProjectChange(value === "none" ? null : value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar proyecto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.programa_id} value={project.programa_id}>
                        {project.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Actor Específico</Label>
                <Select value={selectedActor || "none"} onValueChange={(value) => onActorChange(value === "none" ? null : value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar actor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {actors.map((actor) => (
                      <SelectItem key={actor.actor_id} value={actor.actor_id}>
                        {actor.nombre_actor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Formato de Exportación</Label>
              <RadioGroup 
                value={exportFormat} 
                onValueChange={(value) => onFormatChange(value as 'docx' | 'markdown')}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="docx" id="docx" />
                  <Label htmlFor="docx">Word (.docx)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="markdown" id="markdown" />
                  <Label htmlFor="markdown">Markdown (.md)</Label>
                </div>
              </RadioGroup>
            </div>
          </>
        )}

        {reportType === 'global' && (
          <>
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Los reportes globales incluyen todos los registros y se exportan en formato Excel (.xlsx)
              </p>
            </div>

            {/* Filtros Avanzados para Reportes Globales */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold">Filtros Avanzados</h3>
              
              {/* Filtro por Municipios Activos */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Municipios de Actuación {isLoadingMunicipios && "(Cargando...)"}
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                  {activeMunicipios.map((municipio) => (
                    <div key={municipio} className="flex items-center space-x-2">
                      <Checkbox
                        id={`municipio-${municipio}`}
                        checked={selectedMunicipios.includes(municipio)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onMunicipiosChange([...selectedMunicipios, municipio]);
                          } else {
                            onMunicipiosChange(selectedMunicipios.filter(m => m !== municipio));
                          }
                        }}
                      />
                      <Label htmlFor={`municipio-${municipio}`} className="text-sm">
                        {municipio}
                      </Label>
                    </div>
                  ))}
                  {activeMunicipios.length === 0 && !isLoadingMunicipios && (
                    <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                      No hay municipios con actores registrados
                    </p>
                  )}
                </div>
              </div>

              {/* Filtro por Tipo de Relación */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Tipos de Relación</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TIPO_RELACION_OPTIONS.map((tipo) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tipo-${tipo}`}
                        checked={selectedTipoRelacion.includes(tipo)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onTipoRelacionChange([...selectedTipoRelacion, tipo]);
                          } else {
                            onTipoRelacionChange(selectedTipoRelacion.filter(t => t !== tipo));
                          }
                        }}
                      />
                      <Label htmlFor={`tipo-${tipo}`} className="text-sm">
                        {tipo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por Proyectos */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Proyectos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-3">
                  {projects.map((project) => (
                    <div key={project.programa_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${project.programa_id}`}
                        checked={selectedProjects.includes(project.programa_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onProjectsChange([...selectedProjects, project.programa_id]);
                          } else {
                            onProjectsChange(selectedProjects.filter(p => p !== project.programa_id));
                          }
                        }}
                      />
                      <Label htmlFor={`project-${project.programa_id}`} className="text-sm">
                        {project.nombre}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por Actores */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Actores</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-3">
                  {actors.map((actor) => (
                    <div key={actor.actor_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`actor-${actor.actor_id}`}
                        checked={selectedActors.includes(actor.actor_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            onActorsChange([...selectedActors, actor.actor_id]);
                          } else {
                            onActorsChange(selectedActors.filter(a => a !== actor.actor_id));
                          }
                        }}
                      />
                      <Label htmlFor={`actor-${actor.actor_id}`} className="text-sm">
                        {actor.nombre_actor}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de Descarga Filtrada */}
              {onDownloadFiltered && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={onDownloadFiltered}
                    disabled={!hasFiltersSelected || isLoadingFiltered}
                    className="w-full"
                    variant={hasFiltersSelected ? "default" : "outline"}
                  >
                    {isLoadingFiltered ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando reporte filtrado...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Reporte Filtrado
                      </>
                    )}
                  </Button>
                  {!hasFiltersSelected && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Selecciona al menos un filtro para descargar el reporte
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
