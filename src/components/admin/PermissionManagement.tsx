import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Eye, Edit, Trash2 } from 'lucide-react';

export function PermissionManagement() {
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

  const { data: permissionUsage } = useQuery({
    queryKey: ['permission-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          permission_id,
          user_id,
          permissions(name, description)
        `);
      
      if (error) throw error;
      
      // Get user profiles separately
      const userIds = data?.map(up => up.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      
      // Combine the data
      return data?.map(up => ({
        ...up,
        profile: profiles?.find(p => p.id === up.user_id)
      })) || [];
    }
  });

  const groupedPermissions = permissions?.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, any[]>);

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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read': return <Eye className="h-3 w-3" />;
      case 'write': return <Edit className="h-3 w-3" />;
      case 'delete': return <Trash2 className="h-3 w-3" />;
      default: return <Shield className="h-3 w-3" />;
    }
  };

  const getActionVariant = (action: string) => {
    switch (action) {
      case 'read': return 'secondary';
      case 'write': return 'default';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  const getPermissionUsageCount = (permissionId: string) => {
    return permissionUsage?.filter(up => up.permission_id === permissionId).length || 0;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="by-module" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-module">Por Módulo</TabsTrigger>
          <TabsTrigger value="usage">Uso de Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="by-module" className="space-y-4">
          {Object.entries(groupedPermissions || {}).map(([module, modulePermissions]) => (
            <Card key={module}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {getModuleLabel(module)}
                  <Badge variant="outline">{modulePermissions.length} permisos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {modulePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getActionVariant(permission.action)} className="flex items-center gap-1">
                            {getActionIcon(permission.action)}
                            {permission.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {getPermissionUsageCount(permission.id)} usuarios
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uso de Permisos por Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  (permissionUsage || []).reduce((acc: Record<string, any>, usage) => {
                    const email = usage.profile?.email;
                    if (!email) return acc;
                    
                    if (!acc[email]) {
                      acc[email] = {
                        user: usage.profile,
                        permissions: []
                      };
                    }
                    acc[email].permissions.push(usage.permissions);
                    return acc;
                  }, {})
                ).map(([email, data]) => (
                  <div key={email} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{data.user.full_name || email}</h4>
                        <p className="text-sm text-muted-foreground">{email}</p>
                      </div>
                      <Badge variant="outline">
                        {data.permissions.length} permisos personalizados
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.permissions.map((permission: any, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {permission.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}

                {!permissionUsage?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay usuarios con permisos personalizados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}