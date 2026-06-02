
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Building, Target } from 'lucide-react';

interface ProjectActor {
  actor_id: string;
  nombre_actor: string;
  sector_actor: string;
  tipo_relacion?: string[];
  ciudad_sede?: string;
}

interface ProjectActorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  actors: ProjectActor[];
}

export function ProjectActorsModal({ 
  open, 
  onOpenChange, 
  projectName, 
  actors 
}: ProjectActorsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Actores Involucrados
          </DialogTitle>
          <DialogDescription>
            Actores que participan en el proyecto: <strong>{projectName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {actors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No hay actores asignados a este proyecto</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {actors.map((actor) => (
                <div 
                  key={actor.actor_id}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-medium text-foreground">{actor.nombre_actor}</h4>
                      <p className="text-sm text-muted-foreground">{actor.sector_actor}</p>
                    </div>
                    
                    {actor.ciudad_sede && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Ciudad:</span> {actor.ciudad_sede}
                      </p>
                    )}
                    
                    {actor.tipo_relacion && actor.tipo_relacion.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {actor.tipo_relacion.slice(0, 3).map((tipo, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tipo}
                            </Badge>
                          ))}
                          {actor.tipo_relacion.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{actor.tipo_relacion.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
