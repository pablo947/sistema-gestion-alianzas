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
  role: 'admin' | 'strategic' | 'operative' | 'auditor';
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
  role: z.enum(['admin', 'strategic', 'operative', 'auditor']),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: '',
      email: '',
      role: 'operative',
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
        role: 'operative',
      });
    }
  }, [user, open, form]);

  const createUserMutation = useMutation({
    mutationFn: async (formData: UserFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare permissions array for custom role (no longer used under strict RBAC, kept empty)
      const permissionsArray: string[] = [];

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
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(
        `Usuario preparado exitosamente. ${result.email} puede registrarse en /auth y tendrá el rol asignado automáticamente.`,
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
          role: formData.role,
        })
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      return user.id;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuario actualizado correctamente');
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar usuario: ' + error.message);
    }
  });

  const onSubmit = (data: UserFormData) => {
    if (isEdit) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

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
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="strategic">Gestor Estratégico</SelectItem>
                      <SelectItem value="operative">Gestor Operativo</SelectItem>
                      <SelectItem value="auditor">Auditor de Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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