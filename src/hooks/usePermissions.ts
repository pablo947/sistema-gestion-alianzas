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

const DEFAULT_MODULE_ACCESS: ModuleAccess = { visible: false, level: 'VIEW' };
const VIEW_ONLY: ModuleAccess = { visible: true, level: 'VIEW' };
const EDIT_ACCESS: ModuleAccess = { visible: true, level: 'EDIT' };
const FULL_ACCESS: ModuleAccess = { visible: true, level: 'ADMIN' };

// Define strict module access per role
const ROLE_PERMISSIONS: Record<string, Record<string, ModuleAccess>> = {
  admin: {
    home: VIEW_ONLY,
    actors: FULL_ACCESS,
    contacts: FULL_ACCESS,
    strategies: FULL_ACCESS,
    grafos: FULL_ACCESS,
    projects: FULL_ACCESS,
    team: FULL_ACCESS,
    reports: FULL_ACCESS,
    admin: FULL_ACCESS,
    guide: VIEW_ONLY
  },
  strategic: {
    home: VIEW_ONLY,
    actors: VIEW_ONLY, // Creación de solicitudes permitida explícitamente en UI
    contacts: EDIT_ACCESS, // Crear y editar
    strategies: EDIT_ACCESS, // Agregar recomendaciones
    grafos: VIEW_ONLY,
    projects: VIEW_ONLY, // Solo lectura
    team: VIEW_ONLY, // Solo lectura
    reports: VIEW_ONLY, // Habilitado
    admin: DEFAULT_MODULE_ACCESS, // Bloqueado
    guide: VIEW_ONLY
  },
  operative: {
    home: VIEW_ONLY,
    actors: VIEW_ONLY, // Solo lectura
    contacts: EDIT_ACCESS, // Crear y editar
    strategies: VIEW_ONLY, // Solo lectura
    grafos: VIEW_ONLY,
    projects: VIEW_ONLY, // Solo lectura
    team: VIEW_ONLY, // Solo lectura
    reports: VIEW_ONLY, // Habilitado
    admin: DEFAULT_MODULE_ACCESS, // Bloqueado
    guide: VIEW_ONLY
  },
  auditor: {
    home: VIEW_ONLY,
    actors: FULL_ACCESS, // Funciona como auditor (Aprobar/Rechazar)
    contacts: VIEW_ONLY,
    strategies: VIEW_ONLY,
    grafos: VIEW_ONLY,
    projects: VIEW_ONLY,
    team: VIEW_ONLY,
    reports: VIEW_ONLY,
    admin: DEFAULT_MODULE_ACCESS, // Bloqueado
    guide: VIEW_ONLY
  }
};

export function usePermissions() {
  const { userProfile } = useAuth();

  const isSuperAdmin = (email?: string) => {
    return userProfile?.role === 'admin' || SUPERADMIN_EMAILS.includes(email || userProfile?.email || '');
  };

  const getUserPermissions = (userId: string, email?: string): UserPermission => {
    // Determine the active role, fallback to 'operative' if not set
    let role = userProfile?.role || 'operative';
    
    // Superadmins override role to admin
    if (isSuperAdmin(email)) {
      role = 'admin';
    }

    // Default to operative if role string is invalid
    if (!ROLE_PERMISSIONS[role]) {
      role = 'operative';
    }

    return {
      userId,
      modules: ROLE_PERMISSIONS[role]
    };
  };

  const currentUserPermissions = userProfile?.id ? getUserPermissions(userProfile.id, userProfile.email) : null;

  const saveUserPermissions = async (userId: string, permissions: UserPermission) => {
    // Under new strict RBAC, module-level permissions are inferred from the user's role.
    // Changing permissions requires changing their role in Administration.
    toast({
      title: "Acción no permitida",
      description: "Los permisos están ahora controlados estrictamente por el Rol del usuario. Para cambiar accesos, cambia su Rol."
    });
  };

  const getModuleAccess = (moduleName: string): ModuleAccess => {
    if (!currentUserPermissions) return DEFAULT_MODULE_ACCESS;
    return currentUserPermissions.modules[moduleName] || DEFAULT_MODULE_ACCESS;
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
  const canGenerateReports = () => hasModuleVisibility('reports');
  
  const canViewTeam = () => hasModuleVisibility('team');
  const canEditTeam = () => canEdit('team');
  const canDeleteTeam = () => canDelete('team');

  const canManageUsers = () => hasModuleVisibility('admin') && canEdit('admin');
  const canManagePermissions = () => hasModuleVisibility('admin') && canDelete('admin');

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
    canGenerateReports,
    canViewTeam,
    canEditTeam,
    canDeleteTeam,
    canManageUsers,
    canManagePermissions,
    
    userPermissions: [],
    isAdmin: isSuperAdmin()
  };
}