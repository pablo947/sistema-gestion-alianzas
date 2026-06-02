import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle,
  UserCheck,
  RefreshCw,
  Trash2,
  Pencil,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { EditPendingUserDialog } from './EditPendingUserDialog';

interface PendingUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  permissions: string[];
  created_at: string;
  created_by: string;
}

interface ActivationLog {
  id: string;
  user_id: string;
  email: string;
  status: string;
  error_message: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

const friendlyError = (msg: string | null): string => {
  if (!msg) return 'Error desconocido';
  const lower = msg.toLowerCase();
  if (lower.includes('not registered') || lower.includes('has not registered')) {
    return 'El usuario aún no ha completado su registro inicial.';
  }
  if (lower.includes('no pending')) {
    return 'No existe configuración pendiente para este correo.';
  }
  if (lower.includes('unauthorized')) {
    return 'No tienes permisos para realizar esta acción.';
  }
  if (lower.includes('duplicate') || lower.includes('already exists')) {
    return 'El usuario ya existe en el sistema.';
  }
  if (lower.includes('permission')) {
    return 'Error al asignar permisos. Verifica la configuración.';
  }
  return msg;
};

export function UserActivationPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activatingUsers, setActivatingUsers] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<PendingUser | null>(null);
  const [editTarget, setEditTarget] = useState<PendingUser | null>(null);

  // Active profiles (for cross-check)
  const { data: activeProfiles } = useQuery({
    queryKey: ['active-profile-emails'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('is_active', true);
      if (error) throw error;
      return new Set((data || []).map((p) => p.email.toLowerCase()));
    },
  });

  // Pending users
  const { data: rawPendingUsers, isLoading: loadingPending } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pending_users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PendingUser[];
    },
  });

  // Filter out users already activated (frontend safeguard)
  const pendingUsers = (rawPendingUsers || []).filter(
    (u) => !activeProfiles?.has(u.email.toLowerCase()),
  );

  // Auto-cleanup on mount: remove pending users that already have active profile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.rpc('cleanup_activated_pending_users' as any);
        if (cancelled || error) return;
        const result = data as { success?: boolean; deleted_count?: number };
        if (result?.success && (result.deleted_count ?? 0) > 0) {
          queryClient.invalidateQueries({ queryKey: ['pending-users'] });
        }
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  // Activation logs
  const { data: activationLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['activation-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as ActivationLog[];
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('manually_activate_user', { user_email: email });
      if (error) throw error;
      return data as {
        success: boolean;
        error?: string;
        message?: string;
        pending?: boolean;
        email?: string;
        role?: string;
      };
    },
    onSuccess: (result, email) => {
      if (result?.success) {
        toast({
          title: 'Usuario activado',
          description: `${email} ha sido activado exitosamente.`,
        });
        queryClient.invalidateQueries({ queryKey: ['pending-users'] });
        queryClient.invalidateQueries({ queryKey: ['activation-logs'] });
        queryClient.invalidateQueries({ queryKey: ['active-profile-emails'] });
      } else if (result?.pending) {
        toast({
          title: 'Usuario pendiente de registro',
          description: `${email} aún no ha completado su registro inicial.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error al activar usuario',
          description: friendlyError((result as any)?.error),
          variant: 'destructive',
        });
      }
      setActivatingUsers((prev) => {
        const s = new Set(prev);
        s.delete(email);
        return s;
      });
    },
    onError: (error: any, email) => {
      toast({
        title: 'Error al activar usuario',
        description: friendlyError(error?.message),
        variant: 'destructive',
      });
      setActivatingUsers((prev) => {
        const s = new Set(prev);
        s.delete(email);
        return s;
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pending_users').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Pre-registro eliminado',
        description: 'La invitación ha sido invalidada.',
      });
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast({
        title: 'Error al eliminar',
        description: friendlyError(err?.message),
        variant: 'destructive',
      });
    },
  });

  const handleActivate = (email: string) => {
    setActivatingUsers((prev) => new Set(prev).add(email));
    activateUserMutation.mutate(email);
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-users'] });
    queryClient.invalidateQueries({ queryKey: ['activation-logs'] });
    queryClient.invalidateQueries({ queryKey: ['active-profile-emails'] });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'editor':
        return 'default' as const;
      case 'custom':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('success')) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status.includes('failed')) return <AlertCircle className="w-4 h-4 text-destructive" />;
    return <AlertCircle className="w-4 h-4 text-yellow-600" />;
  };

  if (loadingPending && loadingLogs) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Panel de Activación de Usuarios</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona usuarios pendientes y revisa logs de activación
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {pendingUsers.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Hay {pendingUsers.length} usuario(s) pendiente(s) de activación. Los usuarios deben
            registrarse primero usando el formulario de registro con su correo autorizado.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Usuarios Pendientes de Activación
          </CardTitle>
          <CardDescription>
            Lista sincronizada en tiempo real. Los usuarios ya registrados se eliminan
            automáticamente de esta vista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">
                No hay usuarios pendientes de activación
              </p>
              <p className="text-sm text-muted-foreground">
                Todos los usuarios autorizados han completado su registro exitosamente
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium truncate">
                        {user.full_name || 'Sin nombre'}
                      </span>
                      <Badge variant={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pre-registro realizado{' '}
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                    {user.permissions && user.permissions.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Permisos: {user.permissions.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap shrink-0">
                    <Button
                      onClick={() => handleActivate(user.email)}
                      disabled={activatingUsers.has(user.email)}
                      size="sm"
                      variant="outline"
                      className="min-h-9"
                    >
                      {activatingUsers.has(user.email) ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                          Verificando
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setEditTarget(user)}
                      size="sm"
                      variant="outline"
                      className="min-h-9"
                      aria-label="Editar pre-registro"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => setDeleteTarget(user)}
                      size="sm"
                      variant="outline"
                      className="min-h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Eliminar pre-registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Activación Recientes</CardTitle>
          <CardDescription>Historial de activaciones automáticas y manuales</CardDescription>
        </CardHeader>
        <CardContent>
          {!activationLogs || activationLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay logs de activación disponibles
            </p>
          ) : (
            <div className="space-y-3">
              {activationLogs.map((log) => {
                const isFailure = log.status.includes('failed');
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(log.status)}
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium truncate">{log.email}</span>
                        <Badge variant={log.status.includes('success') ? 'default' : 'destructive'}>
                          {log.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('es-CO')}
                      </p>
                      {log.error_message && (
                        <p className="text-xs text-destructive">
                          Detalle: {friendlyError(log.error_message)}
                        </p>
                      )}
                      {log.resolved_at && (
                        <p className="text-xs text-muted-foreground">
                          Resuelto: {new Date(log.resolved_at).toLocaleString('es-CO')}
                        </p>
                      )}
                    </div>
                    {isFailure && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivate(log.email)}
                        disabled={activatingUsers.has(log.email)}
                        className="shrink-0"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Reintentar
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pre-registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción borrará el pre-registro de{' '}
              <strong>{deleteTarget?.email}</strong> e invalidará cualquier enlace de acceso enviado
              previamente. El usuario tendrá que ser invitado de nuevo para obtener acceso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditPendingUserDialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
        user={editTarget}
      />
    </div>
  );
}
