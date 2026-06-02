import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, Shield, UserCog, UserPlus, KeyRound } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  user_email: string;
  action: string;
  target_type: string;
  target_id: string | null;
  target_label: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Shield; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  role_changed: { label: 'Cambio de Rol', icon: Shield, variant: 'default' },
  permissions_updated: { label: 'Permisos Actualizados', icon: KeyRound, variant: 'secondary' },
  user_created: { label: 'Usuario Creado', icon: UserPlus, variant: 'outline' },
  user_activated: { label: 'Usuario Activado', icon: UserCog, variant: 'outline' },
  user_edited: { label: 'Usuario Editado', icon: UserCog, variant: 'secondary' },
};

export function AuditLogPanel() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as unknown as AuditEntry[];
    },
  });

  const renderDetails = (entry: AuditEntry) => {
    const d = entry.details;
    const parts: string[] = [];

    if (d.old_role && d.new_role) {
      parts.push(`Rol: ${d.old_role} → ${d.new_role}`);
    }
    if (d.permissions_count !== undefined) {
      parts.push(`${d.permissions_count} permisos asignados`);
    }
    if (d.role) {
      parts.push(`Rol: ${d.role}`);
    }

    return parts.length > 0 ? parts.join(' · ') : null;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground">Cargando registros...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Log de Auditoría
        </CardTitle>
        <CardDescription>
          Registro de cambios en roles y permisos del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!logs || logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay registros de auditoría todavía. Los cambios en roles y permisos se registrarán aquí.
          </p>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {logs.map((entry) => {
                const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.role_changed;
                const Icon = config.icon;
                const detailText = renderDetails(entry);

                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="mt-0.5 rounded-full p-1.5 bg-muted">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={config.variant} className="text-xs">
                          {config.label}
                        </Badge>
                        {entry.target_label && (
                          <span className="text-sm font-medium truncate">
                            {entry.target_label}
                          </span>
                        )}
                      </div>
                      {detailText && (
                        <p className="text-xs text-muted-foreground">{detailText}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        por {entry.user_email} · {format(new Date(entry.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
