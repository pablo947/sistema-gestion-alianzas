import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export type AccessLevel = 'VIEW' | 'EDIT' | 'ADMIN';

export interface ModuleAccess {
  visible: boolean;
  level: AccessLevel;
}

export interface UserPermission {
  userId: string;
  modules: Record<string, ModuleAccess>;
}

// Superadmin hardcoded list
export const SUPERADMIN_EMAILS = ['jtoro@funluker.org.co', 'jgaviria@funluker.org.co'];

// Default permissions for a new user
const DEFAULT_MODULE_ACCESS: ModuleAccess = { visible: false, level: 'VIEW' };
const DEFAULT_MODULES = {
  home: { visible: true, level: 'VIEW' as AccessLevel },
  actors: { ...DEFAULT_MODULE_ACCESS },
  contacts: { ...DEFAULT_MODULE_ACCESS },
  strategies: { ...DEFAULT_MODULE_ACCESS },
  grafos: { ...DEFAULT_MODULE_ACCESS },
  projects: { ...DEFAULT_MODULE_ACCESS },
  team: { ...DEFAULT_MODULE_ACCESS },
  reports: { ...DEFAULT_MODULE_ACCESS },
  admin: { ...DEFAULT_MODULE_ACCESS },
  guide: { ...DEFAULT_MODULE_ACCESS }
};

// Global mock state to persist changes across hook unmounts in the same session
let mockDatabase: Record<string, UserPermission> = {};

export function usePermissions() {
  const { userProfile } = useAuth();
  const [localPermissions, setLocalPermissions] = useState<Record<string, UserPermission>>(mockDatabase);

  // Sync with global mock
  useEffect(() => {
    mockDatabase = localPermissions;
  }, [localPermissions]);

  const isSuperAdmin = (email?: string) => {
    return userProfile?.role === 'admin' || SUPERADMIN_EMAILS.includes(email || userProfile?.email || '');
  };

  const getUserPermissions = (userId: string, email?: string): UserPermission => {
    if (isSuperAdmin(email)) {
      // Superadmins have full access to everything always
      const adminModules: Record<string, ModuleAccess> = {};
      Object.keys(DEFAULT_MODULES).forEach(key => {
        adminModules[key] = { visible: true, level: 'ADMIN' };
      });
      return { userId, modules: adminModules };
    }

    if (localPermissions[userId]) {
      return localPermissions[userId];
    }

    // Return default if not set
    return {
      userId,
      modules: { ...DEFAULT_MODULES }
    };
  };

  const currentUserPermissions = userProfile?.id ? getUserPermissions(userProfile.id, userProfile.email) : null;

  const saveUserPermissions = async (userId: string, permissions: UserPermission) => {
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setLocalPermissions(prev => ({
          ...prev,
          [userId]: permissions
        }));
        toast({
          title: "Permisos guardados",
          description: "Los permisos han sido actualizados exitosamente."
        });
        resolve();
      }, 1000);
    });
  };

  const getModuleAccess = (moduleName: string): ModuleAccess => {
    if (!currentUserPermissions) return { visible: false, level: 'VIEW' };
    return currentUserPermissions.modules[moduleName] || { visible: false, level: 'VIEW' };
  };

  const hasModuleVisibility = (moduleName: string) => {
    return getModuleAccess(moduleName).visible;
  };

  const canEdit = (moduleName: string) => {
    const access = getModuleAccess(moduleName);
    return access.visible && (access.level === 'EDIT' || access.level === 'ADMIN');
  };

  const canDelete = (moduleName: string) => {
    const access = getModuleAccess(moduleName);
    return access.visible && access.level === 'ADMIN';
  };

  // Shortcuts mapped to the new system
  const canViewActors = () => hasModuleVisibility('actors');
  const canEditActors = () => canEdit('actors');
  const canDeleteActors = () => canDelete('actors');

  const canViewContacts = () => hasModuleVisibility('contacts');
  const canEditContacts = () => canEdit('contacts');
  const canDeleteContacts = () => canDelete('contacts');

  const canViewProjects = () => hasModuleVisibility('projects');
  const canEditProjects = () => canEdit('projects');
  const canDeleteProjects = () => canDelete('projects');

  const canViewReports = () => hasModuleVisibility('reports');
  const canGenerateReports = () => canEdit('reports') || canDelete('reports'); // If they have more than view, they can generate. Actually generating might be VIEW or EDIT. Let's map generate to VIEW for simplicity or EDIT. Let's make it visible = can generate.
  
  const canViewTeam = () => hasModuleVisibility('team');
  const canEditTeam = () => canEdit('team');
  const canDeleteTeam = () => canDelete('team');

  const canManageUsers = () => hasModuleVisibility('admin') && canEdit('admin');
  const canManagePermissions = () => hasModuleVisibility('admin') && canDelete('admin'); // Only ADMIN level on admin module can change permissions.

  return {
    currentUserPermissions,
    getUserPermissions,
    saveUserPermissions,
    isSuperAdmin,
    
    hasModuleVisibility,
    canEdit,
    canDelete,

    // Backward compatibility shortcuts
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
    canGenerateReports: () => hasModuleVisibility('reports'),
    canViewTeam,
    canEditTeam,
    canDeleteTeam,
    canManageUsers,
    canManagePermissions,
    
    // Some legacy returns to avoid breaking things
    userPermissions: [],
    isAdmin: isSuperAdmin()
  };
}