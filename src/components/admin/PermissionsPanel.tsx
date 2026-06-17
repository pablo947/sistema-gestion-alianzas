import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { usePermissions, UserPermission, AccessLevel, ModuleAccess, SUPERADMIN_EMAILS } from '@/hooks/usePermissions';
import { Loader2, Shield, Eye, Edit, ShieldAlert, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MODULES_INFO = [
  { id: 'home', name: 'Home' },
  { id: 'actors', name: 'Actores' },
  { id: 'contacts', name: 'Contactos' },
  { id: 'strategies', name: 'Clasificación de Aliados' },
  { id: 'grafos', name: 'Análisis de Redes y Relaciones' },
  { id: 'projects', name: 'Programas e Iniciativas' },
  { id: 'team', name: 'Equipo Fundación Luker' },
  { id: 'reports', name: 'Descarga de Reportes' },
  { id: 'admin', name: 'Administración' },
];

export function PermissionsPanel() {
  const { getUserPermissions, saveUserPermissions, isSuperAdmin } = usePermissions();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [localUserPerms, setLocalUserPerms] = useState<UserPermission | null>(null);

  // Fetch all user profiles to populate the UserSelector
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name');
      if (error) throw error;
      return data || [];
    }
  });

  const selectedUser = users?.find(u => u.id === selectedUserId);
  const userIsSuperAdmin = selectedUser ? isSuperAdmin(selectedUser.email) : false;

  useEffect(() => {
    if (selectedUserId && selectedUser) {
      const perms = getUserPermissions(selectedUserId, selectedUser.email);
      // Deep copy to allow local editing before save
      setLocalUserPerms(JSON.parse(JSON.stringify(perms)));
    } else {
      setLocalUserPerms(null);
    }
  }, [selectedUserId, selectedUser]); // Excluded getUserPermissions intentionally to avoid infinite loops

  const handleModuleToggle = (moduleId: string, visible: boolean) => {
    if (!localUserPerms) return;
    setLocalUserPerms(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (!updated.modules[moduleId]) {
        updated.modules[moduleId] = { visible, level: 'VIEW' };
      } else {
        updated.modules[moduleId].visible = visible;
      }
      return updated;
    });
  };

  const handleLevelChange = (moduleId: string, level: AccessLevel) => {
    if (!localUserPerms) return;
    setLocalUserPerms(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (updated.modules[moduleId]) {
        updated.modules[moduleId].level = level;
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedUserId || !localUserPerms) return;
    setIsSaving(true);
    await saveUserPermissions(selectedUserId, localUserPerms);
    setIsSaving(false);
  };

  return (
    <Card className="border-muted/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Gestión de Permisos por Usuario
        </CardTitle>
        <CardDescription>
          Configura los accesos, la visibilidad de módulos y el nivel de interacción por cada usuario.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* User Selector */}
        <div className="space-y-2 max-w-md">
          <label className="text-sm font-medium">Seleccionar Usuario</label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingUsers ? "Cargando usuarios..." : "Selecciona un usuario..."} />
            </SelectTrigger>
            <SelectContent>
              {users?.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name || user.email} {SUPERADMIN_EMAILS.includes(user.email) && " ⭐"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Permissions Configuration Area */}
        {selectedUserId && localUserPerms && (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-4 py-3 border-b flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {userIsSuperAdmin 
                  ? "Este usuario es un Super Administrador. Tiene acceso total garantizado." 
                  : `Configurando accesos para: ${selectedUser?.full_name || selectedUser?.email}`}
              </span>
            </div>
            
            <div className="divide-y">
              {MODULES_INFO.map((mod) => {
                const moduleState = localUserPerms.modules[mod.id] || { visible: false, level: 'VIEW' };
                const isVisible = moduleState.visible;
                const level = moduleState.level;

                return (
                  <div key={mod.id} className={`flex items-center justify-between p-4 transition-colors ${!isVisible ? 'bg-muted/10' : ''}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <Switch 
                        checked={userIsSuperAdmin ? true : isVisible}
                        onCheckedChange={(checked) => handleModuleToggle(mod.id, checked)}
                        disabled={userIsSuperAdmin}
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-400"
                      />
                      <div>
                        <p className={`font-medium ${!isVisible && !userIsSuperAdmin ? 'text-muted-foreground' : ''}`}>
                          {mod.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isVisible || userIsSuperAdmin ? "Módulo visible en el menú" : "Oculto para este usuario"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-48">
                      {(isVisible || userIsSuperAdmin) && (
                        <Select 
                          value={userIsSuperAdmin ? 'ADMIN' : level}
                          onValueChange={(val: AccessLevel) => handleLevelChange(mod.id, val)}
                          disabled={userIsSuperAdmin}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Nivel de acceso" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VIEW">
                              <div className="flex items-center gap-2">
                                <Eye className="h-3.5 w-3.5 text-blue-500" />
                                <span>Solo Vista</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="EDIT">
                              <div className="flex items-center gap-2">
                                <Edit className="h-3.5 w-3.5 text-orange-500" />
                                <span>Edición</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              <div className="flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-red-500" />
                                <span>Admin</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      
      {selectedUserId && !userIsSuperAdmin && (
        <CardFooter className="border-t bg-muted/20 px-6 py-4">
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto btn-animate">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
