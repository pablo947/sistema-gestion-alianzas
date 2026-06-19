import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserFormDialog } from './UserFormDialog';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { toast } from 'sonner';
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
import { Search, Edit, Users, UserPlus, Settings, Ban, Trash2, UserCheck } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  cargo: string | null;
  role: 'admin' | 'strategic' | 'operative' | 'auditor';
  is_active?: boolean;
  created_at: string;
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormDialogOpen, setUserFormDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();
  const { log: auditLog } = useAuditLog();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, cargo, created_at, is_active');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      return profiles?.map(profile => ({
        ...profile,
        cargo: (profile as any).cargo || null,
        role: rolesMap.get(profile.id) || 'operative',
        is_active: (profile as any).is_active ?? true,
      })) || [];
    }
  });



  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, activate }: { userId: string; activate: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: activate } as any)
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      const label = vars.activate ? 'activado' : 'desactivado';
      toast.success(`Usuario ${label} correctamente`);
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { target_user_id: targetUserId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuario eliminado permanentemente');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    }
  });

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSuperAdmin = userProfile?.email === 'santiago.martinez.castilla@gmail.com' ||
                       userProfile?.email === 'jtoro@funluker.org.co';

  const handleCreateUser = () => { setEditingUser(null); setUserFormDialogOpen(true); };
  const handleEditUser = (user: User) => { setEditingUser(user); setUserFormDialogOpen(true); };
  const handleUserFormSuccess = () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); };

  const handleConfirmDeactivate = () => {
    if (!deactivateTarget) return;
    const activate = !deactivateTarget.is_active;
    toggleActiveMutation.mutate({ userId: deactivateTarget.id, activate });
    auditLog(
      activate ? 'user_activated' : 'role_changed',
      'user',
      deactivateTarget.id,
      deactivateTarget.full_name || deactivateTarget.email,
      { action: activate ? 'reactivated' : 'deactivated' }
    );
    setDeactivateTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteUserMutation.mutate(deleteTarget.id);
    auditLog('role_changed', 'user', deleteTarget.id, deleteTarget.full_name || deleteTarget.email, {
      action: 'permanently_deleted',
    });
    setDeleteTarget(null);
  };

  const isSelf = (user: User) => user.email === userProfile?.email;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive' as const;
      case 'strategic': return 'default' as const;
      case 'operative': return 'secondary' as const;
      case 'auditor': return 'outline' as const;
      default: return 'secondary' as const;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'strategic': return 'Gestor Estratégico';
      case 'operative': return 'Gestor Operativo';
      case 'auditor': return 'Auditor de Sistema';
      default: return 'Gestor Operativo';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios por email o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {filteredUsers?.length || 0} usuarios
          </Badge>
        </div>
        {isSuperAdmin && (
          <Button onClick={handleCreateUser} className="flex items-center gap-2 ml-4">
            <UserPlus className="h-4 w-4" />
            Agregar Usuario
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {filteredUsers?.map((user) => (
          <Card
            key={user.id}
            className={`border-l-4 ${user.is_active !== false ? 'border-l-primary/20' : 'border-l-destructive/40 opacity-60'}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{user.full_name || user.email}</CardTitle>
                    {user.is_active === false && (
                      <Badge variant="destructive" className="text-xs">Inactivo</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.cargo && (
                    <p className="text-xs font-medium text-primary mt-1">Cargo: {user.cargo}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  <div className="flex gap-1">
                    {isSuperAdmin && (
                      <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {isSuperAdmin && !isSelf(user) && (
                      <>
                        <Button
                          size="sm"
                          variant={user.is_active !== false ? 'secondary' : 'outline'}
                          onClick={() => setDeactivateTarget(user)}
                          title={user.is_active !== false ? 'Desactivar' : 'Reactivar'}
                        >
                          {user.is_active !== false ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(user)}
                          title="Eliminar permanentemente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Registrado: {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserFormDialog
        open={userFormDialogOpen}
        onOpenChange={setUserFormDialogOpen}
        user={editingUser}
        onSuccess={handleUserFormSuccess}
      />

      {/* Deactivate confirmation */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(open) => !open && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deactivateTarget?.is_active !== false ? '¿Desactivar usuario?' : '¿Reactivar usuario?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget?.is_active !== false
                ? `${deactivateTarget?.full_name || deactivateTarget?.email} no podrá iniciar sesión hasta que sea reactivado.`
                : `${deactivateTarget?.full_name || deactivateTarget?.email} podrá volver a iniciar sesión.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeactivate}>
              {deactivateTarget?.is_active !== false ? 'Desactivar' : 'Reactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es <strong>irreversible</strong>. Se eliminará a{' '}
              <strong>{deleteTarget?.full_name || deleteTarget?.email}</strong> del sistema,
              incluyendo su perfil, rol y permisos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
