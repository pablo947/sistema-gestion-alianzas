import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePermissions() {
  const { isAdmin, userProfile } = useAuth();

  const { data: userPermissions } = useQuery({
    queryKey: ['user-permissions', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          permissions(name, module, action)
        `)
        .eq('user_id', userProfile.id);
      
      if (error) throw error;
      return data?.map(up => up.permissions.name) || [];
    },
    enabled: !!userProfile?.id && !isAdmin
  });

  const hasPermission = (permission: string) => {
    // Admins have all permissions
    if (isAdmin) return true;
    
    // Check if user has specific permission
    return userPermissions?.includes(permission) || false;
  };

  const hasModuleAccess = (module: string, action: 'read' | 'write' | 'delete' | 'generate' = 'read') => {
    return hasPermission(`${module}:${action}`);
  };

  // Role-based permission shortcuts
  const canViewActors = () => hasModuleAccess('actors', 'read');
  const canEditActors = () => hasModuleAccess('actors', 'write');
  const canDeleteActors = () => hasModuleAccess('actors', 'delete');

  const canViewContacts = () => hasModuleAccess('contacts', 'read');
  const canEditContacts = () => hasModuleAccess('contacts', 'write');
  const canDeleteContacts = () => hasModuleAccess('contacts', 'delete');

  const canViewProjects = () => hasModuleAccess('projects', 'read');
  const canEditProjects = () => hasModuleAccess('projects', 'write');
  const canDeleteProjects = () => hasModuleAccess('projects', 'delete');

  const canViewReports = () => hasModuleAccess('reports', 'read');
  const canGenerateReports = () => hasModuleAccess('reports', 'generate');

  const canViewTeam = () => hasModuleAccess('team', 'read');
  const canEditTeam = () => hasModuleAccess('team', 'write');

  const canManageUsers = () => hasPermission('admin:users');
  const canManagePermissions = () => hasPermission('admin:permissions');

  return {
    hasPermission,
    hasModuleAccess,
    // Shortcuts
    canViewActors,
    canEditActors,
    canDeleteActors,
    canViewContacts,
    canEditContacts,
    canDeleteContacts,
    canViewProjects,
    canEditProjects,
    canDeleteProjects,
    canViewReports,
    canGenerateReports,
    canViewTeam,
    canEditTeam,
    canManageUsers,
    canManagePermissions,
    // Raw data
    userPermissions: userPermissions || [],
    isAdmin
  };
}