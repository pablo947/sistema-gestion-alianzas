import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, UserPlus, Mail } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess: () => void;
}

const userSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'editor', 'viewer', 'custom']),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const isEdit = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: '',
      email: '',
      role: 'viewer',
    },
  });

  const watchedRole = form.watch('role');

  useEffect(() => {
    if (user && open) {
      form.reset({
        full_name: user.full_name || '',
        email: user.email,
        role: user.role,
      });
    } else if (!user && open) {
      form.reset({
        full_name: '',
        email: '',
        role: 'viewer',
      });
      setSelectedPermissions([]);
    }
  }, [user, open, form]);

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
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_id, permissions(name)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: isEdit && open
  });

  useEffect(() => {
    if (userPermissions && open) {
      setSelectedPermissions(userPermissions.map(up => up.permissions.name));
    }
  }, [userPermissions, open]);

  const createUserMutation = useMutation({
    mutationFn: async (formData: UserFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare permissions array for custom role
      const permissionsArray = formData.role === 'custom' 
        ? selectedPermissions
        : [];

      // Insert into pending_users table
      const { error: pendingUserError } = await supabase
        .from('pending_users')
        .insert({
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          permissions: permissionsArray,
          created_by: user?.id,
        });

      if (pendingUserError) throw pendingUserError;

      return { email: formData.email };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(
        `Usuario preparado exitosamente. ${result.email} puede registrarse en /auth y tendrá permisos automáticamente.`,
        { duration: 6000 }
      );
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Error al preparar usuario: ' + error.message);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (formData: UserFormData) => {
      if (!user) return;

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          role: formData.role === 'custom' ? 'viewer' : formData.role,
        })
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      return user.id;
    },
    onSuccess: (userId) => {
      if (userId && watchedRole === 'custom') {
        savePermissionsMutation.mutate(userId);
      } else {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Usuario actualizado correctamente');
        onSuccess();
        onOpenChange(false);
      }
    },
    onError: (error: any) => {
      toast.error('Error al actualizar usuario: ' + error.message);
    }
  });

  const savePermissionsMutation = useMutation({
    mutationFn: async (userId: string) => {
      // First, delete existing permissions
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      // Then insert new permissions if role is custom
      if (watchedRole === 'custom' && selectedPermissions.length > 0) {
        const permissionIds = selectedPermissions
          .map(permName => permissions?.find(p => p.name === permName)?.id)
          .filter(Boolean);

        const permissionsToInsert = permissionIds.map(permissionId => ({
          user_id: userId,
          permission_id: permissionId,
        }));

        const { error } = await supabase
          .from('user_permissions')
          .insert(permissionsToInsert);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success(isEdit ? 'Usuario actualizado correctamente' : `Usuario preparado exitosamente. ${form.getValues().email} puede ahora registrarse en /auth.`);
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Error al configurar permisos: ' + error.message);
    }
  });

  const onSubmit = (data: UserFormData) => {
    if (isEdit) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
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

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending || savePermissionsMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <Mail className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            {isEdit ? 'Editar Usuario' : 'Agregar Usuario'}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? `Modifica la información y permisos de ${user?.full_name || user?.email}`
              : 'Prepara un nuevo usuario con permisos predefinidos. El usuario deberá registrarse manualmente en /auth para activar su cuenta.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="juan@ejemplo.com" 
                        {...field}
                        disabled={isEdit}
                      />
                    </FormControl>
                    <FormMessage />
                    {isEdit && (
                      <p className="text-xs text-muted-foreground">
                        El email no se puede modificar
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol del Usuario</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrador (Todos los permisos)</SelectItem>
                      <SelectItem value="editor">Editor (Lectura y escritura)</SelectItem>
                      <SelectItem value="viewer">Consulta (Solo lectura)</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedRole === 'custom' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Permisos Específicos
                    <Badge variant="outline">
                      {selectedPermissions.length} seleccionados
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Guardando...' : (isEdit ? 'Actualizar Usuario' : 'Crear Usuario')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}