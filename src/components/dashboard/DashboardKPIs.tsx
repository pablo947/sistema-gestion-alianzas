
import { Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProgramsStatusCard } from '@/components/dashboard/ProgramsStatusCard';

interface DashboardKPIsProps {
  totalActors: number;
  activePrograms: number;
  plannedPrograms: number;
  completedPrograms: number;
  totalPrograms: number;
  completionRate: number;
  totalContacts: number;
}

export const DashboardKPIs = ({ 
  totalActors, 
  activePrograms,
  plannedPrograms,
  completedPrograms,
  totalPrograms,
  completionRate, 
  totalContacts 
}: DashboardKPIsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <KPICard
        title="Total Actores"
        value={totalActors}
        description="Actores registrados en el sistema"
        icon={Users}
        trend={+12}
        onClick={() => navigate('/actors')}
      />
      <ProgramsStatusCard
        plannedPrograms={plannedPrograms}
        activePrograms={activePrograms}
        completedPrograms={completedPrograms}
        totalPrograms={totalPrograms}
        onClick={() => navigate('/programs')}
      />
      <KPICard
        title="Total Contactos"
        value={totalContacts}
        description="Contactos registrados"
        icon={MessageSquare}
        trend={+20}
        onClick={() => navigate('/contacts')}
      />
    </div>
  );
};
