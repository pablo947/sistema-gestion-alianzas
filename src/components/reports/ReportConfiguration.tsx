import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";

interface ReportConfigurationProps {
  reportType: 'global' | 'individual';
  onReportTypeChange: (value: 'global' | 'individual') => void;
  selectedProgram: string;
  onSelectedProgramChange: (value: string) => void;
  selectedActor: string;
  onSelectedActorChange: (value: string) => void;
  exportFormat: 'excel' | 'word';
  onExportFormatChange: (value: 'excel' | 'word') => void;
  programs: any[];
  actors: any[];
}

export const ReportConfiguration: React.FC<ReportConfigurationProps> = ({
  reportType,
  onReportTypeChange,
  selectedProgram,
  onSelectedProgramChange,
  selectedActor,
  onSelectedActorChange,
  exportFormat,
  onExportFormatChange,
  programs,
  actors
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Reportes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo de Reporte</Label>
          <RadioGroup value={reportType} onValueChange={onReportTypeChange} className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="global" id="global" />
              <Label htmlFor="global">Reporte Global</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="individual" id="individual" />
              <Label htmlFor="individual">Reporte Individual</Label>
            </div>
          </RadioGroup>
        </div>

        {reportType === 'individual' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program-select">Seleccionar Programa</Label>
              <Select value={selectedProgram} onValueChange={onSelectedProgramChange}>
                <SelectTrigger id="program-select">
                  <SelectValue placeholder="Selecciona un programa" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.programa_id} value={program.programa_id}>
                      {program.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actor-select">Seleccionar Actor</Label>
              <Select value={selectedActor} onValueChange={onSelectedActorChange}>
                <SelectTrigger id="actor-select">
                  <SelectValue placeholder="Selecciona un actor" />
                </SelectTrigger>
                <SelectContent>
                  {actors.map((actor) => (
                    <SelectItem key={actor.actor_id} value={actor.actor_id}>
                      {actor.nombre_actor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-sm font-medium">Formato de Exportación</Label>
          <RadioGroup value={exportFormat} onValueChange={onExportFormatChange} className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel">Excel (.xlsx)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="word" id="word" />
              <Label htmlFor="word">Word (.docx)</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};