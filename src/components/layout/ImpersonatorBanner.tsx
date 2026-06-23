import { useImpersonation } from '@/hooks/useImpersonation';
import { Button } from '@/components/ui/button';
import { AlertCircle, XCircle } from 'lucide-react';

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  strategic: 'Gestor Estratégico',
  operative: 'Gestor Operativo',
  auditor: 'Auditor',
};

export function ImpersonatorBanner() {
  const { simulatedRole, setSimulatedRole } = useImpersonation();

  if (!simulatedRole) return null;

  return (
    <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between shadow-md z-50 sticky top-0">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span className="font-semibold text-sm">
          Modo de simulación: Visualizando como {roleLabels[simulatedRole] || simulatedRole}
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-white hover:bg-orange-600 hover:text-white"
        onClick={() => setSimulatedRole(null)}
      >
        <XCircle className="w-4 h-4 mr-2" />
        Salir de simulación
      </Button>
    </div>
  );
}
