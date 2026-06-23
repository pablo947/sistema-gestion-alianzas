import { useState, useEffect } from 'react';

type Role = 'admin' | 'strategic' | 'operative' | 'auditor';

export function useImpersonation() {
  const [simulatedRole, setSimulatedRoleState] = useState<Role | null>(() => {
    const stored = localStorage.getItem('simulatedRole');
    return stored ? (stored as Role) : null;
  });

  const setSimulatedRole = (role: Role | null) => {
    if (role) {
      localStorage.setItem('simulatedRole', role);
    } else {
      localStorage.removeItem('simulatedRole');
    }
    setSimulatedRoleState(role);
    // Dispatch a custom event so other components (like usePermissions) can re-render if needed
    window.dispatchEvent(new Event('simulatedRoleChange'));
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'simulatedRole') {
        setSimulatedRoleState(e.newValue ? (e.newValue as Role) : null);
      }
    };
    
    const handleLocalChange = () => {
      const stored = localStorage.getItem('simulatedRole');
      setSimulatedRoleState(stored ? (stored as Role) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('simulatedRoleChange', handleLocalChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('simulatedRoleChange', handleLocalChange);
    };
  }, []);

  return { simulatedRole, setSimulatedRole };
}
