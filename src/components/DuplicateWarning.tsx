import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface DuplicateWarningProps {
  duplicates: { id: string; name: string; score: number; matchedFields?: string[] }[];
  entityType: 'actor' | 'contact';
  onViewExisting?: (id: string) => void;
  onAcknowledge?: () => void;
}

export function DuplicateWarning({ duplicates, entityType, onViewExisting, onAcknowledge }: DuplicateWarningProps) {
  if (duplicates.length === 0) return null;

  const label = entityType === 'actor' ? 'Actor' : 'Contacto';

  return (
    <Alert className="border-luker-orange/40 bg-luker-blue-light text-foreground shadow-sm">
      <AlertTriangle className="h-4 w-4 !text-luker-orange" />
      <AlertTitle className="font-semibold text-foreground">
        Posible {label.toLowerCase()} similar detectado
      </AlertTitle>
      <AlertDescription className="text-muted-foreground">
        <p className="mb-2">
          Se encontraron coincidencias. Puedes revisarlas o continuar si confirmas que es un registro distinto.
        </p>
        <ul className="space-y-2">
          {duplicates.map((dup) => (
            <li key={dup.id} className="flex flex-col gap-3 rounded-md border border-luker-orange/20 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <span className="font-medium text-foreground">{dup.name}</span>
                {dup.matchedFields && dup.matchedFields.length > 0 && (
                  <p className="text-xs text-luker-orange">
                    Alta similitud en: {dup.matchedFields.join(', ')}
                  </p>
                )}
              </div>
              {onViewExisting && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10 w-full border-luker-orange/40 text-xs text-foreground hover:bg-accent sm:w-auto"
                  onClick={() => onViewExisting(dup.id)}
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Ir a editar el registro existente
                </Button>
              )}
            </li>
          ))}
        </ul>
        {onAcknowledge && (
          <Button type="button" className="mt-3 min-h-10 w-full btn-animate sm:w-auto" onClick={onAcknowledge}>
            Continuar con la creación de todos modos
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
