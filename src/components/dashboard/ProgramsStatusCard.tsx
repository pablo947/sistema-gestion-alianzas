
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, Clock, Play, CheckCircle } from 'lucide-react';

interface ProgramsStatusCardProps {
  plannedPrograms: number;
  activePrograms: number;
  completedPrograms: number;
  totalPrograms: number;
  onClick?: () => void;
}

export function ProgramsStatusCard({ 
  plannedPrograms, 
  activePrograms, 
  completedPrograms, 
  totalPrograms,
  onClick 
}: ProgramsStatusCardProps) {
  console.log('ProgramsStatusCard props:', {
    plannedPrograms,
    activePrograms, 
    completedPrograms,
    totalPrograms
  });

  return (
    <Card 
      className={`btn-animate hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Estado de Programas</CardTitle>
        <FolderKanban className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-3">
          {totalPrograms} Total
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-yellow-600" />
              <span>Planificado</span>
            </div>
            <span className="font-medium">{plannedPrograms}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Play className="h-3 w-3 text-green-600" />
              <span>Ejecución</span>
            </div>
            <span className="font-medium">{activePrograms}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              <span>Finalizado</span>
            </div>
            <span className="font-medium">{completedPrograms}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
