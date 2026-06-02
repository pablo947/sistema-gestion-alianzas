import { useNavigate } from 'react-router-dom';
import { useInfluenceInterest } from '@/hooks/useInfluenceInterest';
import { useActorRelations } from '@/hooks/useActorRelations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Contact, Users, FolderKanban, Search, FileDown, Award } from 'lucide-react';
import { HeatMap } from '@/components/dashboard/HeatMap';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const modules = [
  {
    title: "Actores",
    description: "Gestión de actores y alianzas estratégicas",
    icon: Building2,
    url: "/actors",
  },
  {
    title: "Información de Contacto",
    description: "Directorio de contactos asociados",
    icon: Contact,
    url: "/contacts",
  },
  {
    title: "Equipo Fundación Luker",
    description: "Miembros del equipo interno",
    icon: Users,
    url: "/team",
  },
  {
    title: "Proyectos e Iniciativas",
    description: "Seguimiento y estado de proyectos e iniciativas",
    icon: FolderKanban,
    url: "/projects",
  },
  {
    title: "Análisis de Redes",
    description: "Visualización de relaciones y grafos",
    icon: Search,
    url: "/grafos",
  },
  {
    title: "Descarga de Reportes",
    description: "Exportación de datos e informes",
    icon: FileDown,
    url: "/reports",
  },
];

const BAR_COLORS = ['#F59E0B', '#22C55E', '#1E3A5F', '#06B6D4', '#6366F1', '#EC4899', '#8B5CF6'];

const Index = () => {
  const navigate = useNavigate();
  const { data: influenceInterest } = useInfluenceInterest();
  const { data: relationsData } = useActorRelations();

  const { data: actorCount } = useQuery({
    queryKey: ['actors-count'],
    queryFn: async () => {
      const { count } = await supabase.from('actors').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  const { data: contactCount } = useQuery({
    queryKey: ['contacts-count'],
    queryFn: async () => {
      const { count } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground">
          Sistema de Gestión de Alianzas y Programas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Vista General</p>
      </div>

      {/* Bento Grid */}
      <TooltipProvider delayDuration={200}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const tooltipText =
              mod.url === '/actors' && actorCount !== undefined
                ? `Total de actores registrados: ${actorCount}`
                : mod.url === '/contacts' && contactCount !== undefined
                  ? `Total de contactos registrados: ${contactCount}`
                  : null;

            const card = (
              <Card
                key={mod.url}
                className="group cursor-pointer border border-border hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => navigate(mod.url)}
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="rounded-xl p-3 bg-primary/5 shrink-0">
                    <mod.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                  </div>
                </CardContent>
              </Card>
            );

            if (tooltipText) {
              return (
                <UITooltip key={mod.url}>
                  <TooltipTrigger asChild>{card}</TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs text-muted-foreground bg-card border border-border">
                    {tooltipText}
                  </TooltipContent>
                </UITooltip>
              );
            }

            return card;
          })}
        </div>
      </TooltipProvider>

      {/* Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Influence-Interest Matrix */}
        <Card className="border border-border cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigate('/strategies')}>
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Matriz Influencia–Interés</h2>
              <p className="text-xs text-muted-foreground">Distribución de actores por nivel de influencia e interés</p>
            </div>
            <HeatMap data={influenceInterest || []} />
          </CardContent>
        </Card>

        {/* Actor Relations Bar Chart */}
        <Card className="border border-border cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => navigate('/strategies#tipos')}>
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Relaciones de Actores</h2>
              <p className="text-xs text-muted-foreground">Distribución de actores por tipo de relación con la Fundación</p>
            </div>
            {relationsData && relationsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={relationsData} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Actores">
                    {relationsData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                Cargando datos...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
