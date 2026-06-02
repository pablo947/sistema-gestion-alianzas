import { CalendarDays, Database, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ModuleStatsPanelProps {
  totalCount: number;
  label: string;
  lastUpdatedAt?: string | null;
  lastUpdatedBy?: string | null;
}

export function ModuleStatsPanel({ totalCount, label, lastUpdatedAt, lastUpdatedBy }: ModuleStatsPanelProps) {
  const formattedDate = lastUpdatedAt
    ? format(new Date(lastUpdatedAt), "d 'de' MMMM, yyyy", { locale: es })
    : '—';
  const formattedTime = lastUpdatedAt
    ? format(new Date(lastUpdatedAt), "HH:mm", { locale: es })
    : '';

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Database className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{totalCount}</span> {label}
      </span>
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        Última actualización: <span className="font-medium text-foreground">{formattedDate}</span>
        {formattedTime && <span className="text-muted-foreground">a las {formattedTime}</span>}
      </span>
      {lastUpdatedBy && (
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          Editado por: <span className="font-medium text-foreground">{lastUpdatedBy}</span>
        </span>
      )}
    </div>
  );
}
