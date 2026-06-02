
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IndicadorTecnico } from "./types";

interface ProjectIndicatorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  indicators: IndicadorTecnico[];
}

export function ProjectIndicatorsModal({ 
  open, 
  onOpenChange, 
  projectName, 
  indicators 
}: ProjectIndicatorsModalProps) {
  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500/10 text-green-700 border-green-200';
    if (percentage >= 70) return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    if (percentage >= 50) return 'bg-orange-500/10 text-orange-700 border-orange-200';
    return 'bg-red-500/10 text-red-700 border-red-200';
  };

  const calculatePercentage = (avance: number, meta: string) => {
    const metaNumeric = parseFloat(meta);
    if (isNaN(metaNumeric) || metaNumeric === 0) return 0;
    return Math.round((avance / metaNumeric) * 100);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'gestión':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'impacto':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'resultado':
        return 'bg-green-500/10 text-green-700 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Indicadores Técnicos - {projectName}
          </DialogTitle>
        </DialogHeader>

        {indicators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay indicadores técnicos configurados para este proyecto.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {indicators.length} indicador{indicators.length !== 1 ? 'es' : ''} técnico{indicators.length !== 1 ? 's' : ''} configurado{indicators.length !== 1 ? 's' : ''}
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Indicador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Áreas</TableHead>
                    <TableHead>Meta</TableHead>
                    <TableHead>Avance</TableHead>
                    <TableHead>Cumplimiento</TableHead>
                    <TableHead>Frecuencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indicators.map((indicator) => {
                    const percentage = calculatePercentage(indicator.avance, indicator.meta);
                    
                    return (
                      <TableRow key={indicator.id}>
                        <TableCell>
                          <Badge variant="outline">{indicator.codigo}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={indicator.indicador}>
                            {indicator.indicador}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTipoColor(indicator.tipo)}>
                            {indicator.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {indicator.areas_reportan.slice(0, 2).map(area => (
                              <Badge key={area} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                            {indicator.areas_reportan.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{indicator.areas_reportan.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{indicator.meta}</TableCell>
                        <TableCell>{indicator.avance}</TableCell>
                        <TableCell>
                          <Badge className={getComplianceColor(percentage)}>
                            {percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{indicator.frecuencia_reporte}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
