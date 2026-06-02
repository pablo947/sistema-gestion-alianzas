import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { useAuditLog } from '@/hooks/useAuditLog';
interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'editor' | 'viewer' | 'custom';
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

interface UserPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onRoleUpdate: (role: string) => void;
}

export function UserPermissionsDialog({ open, onOpenChange, user, onRoleUpdate }: UserPermissionsDialogProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { log: auditLog } = useAuditLog();

  const { data: permissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module, action');
      
      if (error) throw error;
      return data;
    }
  });

  const { data: userPermissions } = useQuery({
    queryKey: ['user-permissions', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_id, permissions(name)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: open
  });

  useEffect(() => {
    if (userPermissions) {
      setSelectedPermissions(userPermissions.map(up => up.permissions.name));
    }
  }, [userPermissions]);

  const savePermissionsMutation = useMutation({
    mutationFn: async () => {
      // First, delete existing permissions
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', user.id);

      // Then insert new permissions if role is custom
      if (selectedRole === 'custom' && selectedPermissions.length > 0) {
        const permissionIds = selectedPermissions
          .map(permName => permissions?.find(p => p.name === permName)?.id)
          .filter(Boolean);

        const permissionsToInsert = permissionIds.map(permissionId => ({
          user_id: user.id,
          permission_id: permissionId,
          granted_by: null // Will be set by the current admin user
        }));

        const { error } = await supabase
          .from('user_permissions')
          .insert(permissionsToInsert);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      
      // Log permissions change
      auditLog('permissions_updated', 'permission', user.id, user.full_name || user.email, {
        role: selectedRole,
        permissions_count: selectedPermissions.length,
        permissions: selectedPermissions,
      });

      toast.success('Permisos actualizados correctamente');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Error al actualizar permisos: ' + error.message);
    }
  });

  const handleSave = () => {
    // Log role change if different
    if (selectedRole !== user.role) {
      auditLog('role_changed', 'role', user.id, user.full_name || user.email, {
        old_role: user.role,
        new_role: selectedRole,
      });
    }
    onRoleUpdate(selectedRole);
    savePermissionsMutation.mutate();
  };

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  const groupedPermissions = permissions?.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getModuleLabel = (module: string) => {
    const labels: Record<string, string> = {
      actors: 'Actores',
      contacts: 'Contactos',
      projects: 'Proyectos',
      reports: 'Reportes',
      team: 'Equipo',
      admin: 'Administración'
    };
    return labels[module] || module;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      read: 'Ver',
      write: 'Editar',
      delete: 'Eliminar',
      generate: 'Generar',
      users: 'Usuarios',
      permissions: 'Permisos'
    };
    return labels[action] || action;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Usuario</DialogTitle>
          <DialogDescription>
            Configura el rol y permisos para {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role">Rol del Usuario</Label>
            <Select value={selectedRole} onValueChange={(value: 'admin' | 'editor' | 'viewer' | 'custom') => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador (Todos los permisos)</SelectItem>
                <SelectItem value="editor">Editor (Lectura y escritura)</SelectItem>
                <SelectItem value="viewer">Consulta (Solo lectura)</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === 'custom' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Permisos Específicos</Label>
                <Badge variant="outline">
                  {selectedPermissions.length} seleccionados
                </Badge>
              </div>

              <div className="space-y-4">
                {Object.entries(groupedPermissions || {}).map(([module, modulePermissions]) => (
                  <div key={module} className="space-y-2">
                    <h4 className="font-medium text-sm text-primary">
                      {getModuleLabel(module)}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 pl-4">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.name}
                            checked={selectedPermissions.includes(permission.name)}
                            onCheckedChange={() => togglePermission(permission.name)}
                          />
                          <Label
                            htmlFor={permission.name}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {getActionLabel(permission.action)}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {module !== 'admin' && <Separator className="mt-2" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={savePermissionsMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {savePermissionsMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}