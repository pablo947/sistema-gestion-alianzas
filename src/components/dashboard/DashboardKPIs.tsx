
import { Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProjectsStatusCard } from '@/components/dashboard/ProjectsStatusCard';

interface DashboardKPIsProps {
  totalActors: number;
  activeProjects: number;
  plannedProjects: number;
  completedProjects: number;
  totalProjects: number;
  completionRate: number;
  totalContacts: number;
}

export const DashboardKPIs = ({ 
  totalActors, 
  activeProjects,
  plannedProjects,
  completedProjects,
  totalProjects,
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
      <ProjectsStatusCard
        plannedProjects={plannedProjects}
        activeProjects={activeProjects}
        completedProjects={completedProjects}
        totalProjects={totalProjects}
        onClick={() => navigate('/projects')}
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
