import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Save, Pencil } from 'lucide-react';

interface PendingUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PendingUser | null;
  onSuccess?: () => void;
}

const schema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'editor', 'viewer', 'custom']),
});

type FormData = z.infer<typeof schema>;

const moduleLabels: Record<string, string> = {
  actors: 'Actores',
  contacts: 'Contactos',
  projects: 'Proyectos',
  reports: 'Reportes',
  team: 'Equipo',
  admin: 'Administración',
};

const actionLabels: Record<string, string> = {
  read: 'Ver',
  write: 'Editar',
  delete: 'Eliminar',
  generate: 'Generar',
  users: 'Usuarios',
  permissions: 'Permisos',
};

export function EditPendingUserDialog({ open, onOpenChange, user, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', role: 'viewer' },
  });

  const watchedRole = form.watch('role');

  useEffect(() => {
    if (user && open) {
      form.reset({
        full_name: user.full_name || '',
        role: (user.role as FormData['role']) || 'viewer',
      });
      setSelectedPermissions(user.permissions || []);
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
      return data as Permission[];
    },
    enabled: open,
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user) throw new Error('No user');
      const permsArray = formData.role === 'custom' ? selectedPermissions : [];
      const { error } = await supabase
        .from('pending_users')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          permissions: permsArray,
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Pre-registro actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['pending-users'] });
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error('Error al actualizar: ' + err.message);
    },
  });

  const togglePerm = (name: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  };

  const grouped = permissions?.reduce((acc, p) => {
    (acc[p.module] ||= []).push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Editar Pre-registro
          </DialogTitle>
          <DialogDescription>
            Modifica los datos antes de que el usuario complete su registro. Los cambios se aplicarán automáticamente cuando se registre.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
            <div className="space-y-2">
              <Label>Correo (no editable)</Label>
              <Input value={user?.email || ''} disabled />
            </div>

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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
                  <CardTitle className="flex items-center gap-2 text-base">
                    Permisos Específicos
                    <Badge variant="outline">{selectedPermissions.length} seleccionados</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(grouped || {}).map(([mod, perms]) => (
                    <div key={mod} className="space-y-2">
                      <h4 className="font-medium text-sm text-primary">
                        {moduleLabels[mod] || mod}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        {perms.map((p) => (
                          <div key={p.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pp-${p.id}`}
                              checked={selectedPermissions.includes(p.name)}
                              onCheckedChange={() => togglePerm(p.name)}
                            />
                            <Label htmlFor={`pp-${p.id}`} className="text-sm font-normal cursor-pointer">
                              {actionLabels[p.action] || p.action}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {mod !== 'admin' && <Separator className="mt-2" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
