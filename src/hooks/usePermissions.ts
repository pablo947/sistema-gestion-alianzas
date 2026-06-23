import { useAuth } from './useAuth';
import { useImpersonation } from './useImpersonation';
import { toast } from './use-toast';

export type AccessLevel = 'VIEW' | 'EDIT' | 'ADMIN' | 'CREATE_PENDING' | 'APPROVE_REJECT' | 'RECOMMENDATIONS_ONLY';

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

// Define strict module access per role according to the matrix
const ROLE_PERMISSIONS: Record<string, Record<string, ModuleAccess>> = {
  admin: {
    home: VIEW_ONLY,
    actors: FULL_ACCESS,
    contacts: FULL_ACCESS,
    strategies: FULL_ACCESS,
    grafos: FULL_ACCESS,
    projects: FULL_ACCESS,
    team: FULL_ACCESS,
    reports: VIEW_ONLY, // Visualización/Descarga
    admin: FULL_ACCESS,
    guide: VIEW_ONLY
  },
  strategic: {
    home: VIEW_ONLY,
    actors: { visible: true, level: 'CREATE_PENDING' },
    contacts: EDIT_ACCESS,
    strategies: { visible: true, level: 'RECOMMENDATIONS_ONLY' },
    grafos: VIEW_ONLY,
    projects: VIEW_ONLY,
    team: VIEW_ONLY,
    reports: VIEW_ONLY,
    admin: DEFAULT_MODULE_ACCESS,
    guide: VIEW_ONLY
  },
  operative: {
    home: VIEW_ONLY,
    actors: VIEW_ONLY,
    contacts: EDIT_ACCESS,
    strategies: VIEW_ONLY,
    grafos: VIEW_ONLY,
    projects: VIEW_ONLY,
    team: VIEW_ONLY,
    reports: VIEW_ONLY,
    admin: DEFAULT_MODULE_ACCESS,
    guide: VIEW_ONLY
  },
  auditor: {
    home: VIEW_ONLY,
    actors: { visible: true, level: 'APPROVE_REJECT' },
    contacts: VIEW_ONLY,
    strategies: VIEW_ONLY,
    grafos: VIEW_ONLY,
    projects: VIEW_ONLY,
    team: VIEW_ONLY,
    reports: VIEW_ONLY,
    admin: DEFAULT_MODULE_ACCESS,
    guide: VIEW_ONLY
  }
};

export function usePermissions() {
  const { userProfile } = useAuth();
  const { simulatedRole } = useImpersonation();

  const isSuperAdmin = (email?: string) => {
    return userProfile?.role === 'admin' || SUPERADMIN_EMAILS.includes(email || userProfile?.email || '');
  };

  const getUserPermissions = (userId: string, email?: string): UserPermission => {
    // 1. Determine real role
    let realRole = userProfile?.role || 'operative';
    if (isSuperAdmin(email)) {
      realRole = 'admin';
    }

    // 2. Check for simulated role ONLY if real role is admin
    let activeRole = realRole;
    if (realRole === 'admin' && simulatedRole) {
      activeRole = simulatedRole;
    }

    // Default to operative if role string is invalid
    if (!ROLE_PERMISSIONS[activeRole]) {
      activeRole = 'operative';
    }

    return {
      userId,
      modules: ROLE_PERMISSIONS[activeRole]
    };
  };

  const currentUserPermissions = userProfile?.id ? getUserPermissions(userProfile.id, userProfile.email) : null;

  const saveUserPermissions = async (userId: string, permissions: UserPermission) => {
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

  // Fine-grained checks based on the new matrix
  const canCreatePendingActors = () => {
    const access = getModuleAccess('actors');
    return access.visible && (access.level === 'CREATE_PENDING' || access.level === 'ADMIN');
  };

  const canApproveRejectActors = () => {
    const access = getModuleAccess('actors');
    return access.visible && (access.level === 'APPROVE_REJECT' || access.level === 'ADMIN');
  };

  const canEditRecommendations = () => {
    const access = getModuleAccess('strategies');
    return access.visible && (access.level === 'RECOMMENDATIONS_ONLY' || access.level === 'ADMIN' || access.level === 'EDIT');
  };

  // Shortcuts mapped to the new system
  const canViewActors = () => hasModuleVisibility('actors');
  const canEditActors = () => canEdit('actors') || canCreatePendingActors(); // We allow opening the form for CREATE_PENDING
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

    // Fine-grained exports
    canCreatePendingActors,
    canApproveRejectActors,
    canEditRecommendations,

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