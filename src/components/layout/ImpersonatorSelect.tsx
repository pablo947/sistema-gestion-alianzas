import { useAuth } from '@/hooks/useAuth';
import { useImpersonation } from '@/hooks/useImpersonation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCircle2 } from 'lucide-react';

export function ImpersonatorSelect() {
  const { userProfile } = useAuth();
  const { simulatedRole, setSimulatedRole } = useImpersonation();

  // Only render for real admins
  if (userProfile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <UserCircle2 className="w-4 h-4 text-muted-foreground hidden sm:block" />
      <Select 
        value={simulatedRole || 'admin'} 
        onValueChange={(value) => {
          if (value === 'admin') {
            setSimulatedRole(null);
          } else {
            setSimulatedRole(value as any);
          }
        }}
      >
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Visualizar como..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Administrador (Real)</SelectItem>
          <SelectItem value="strategic">Gestor Estratégico</SelectItem>
          <SelectItem value="operative">Gestor Operativo</SelectItem>
          <SelectItem value="auditor">Auditor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
