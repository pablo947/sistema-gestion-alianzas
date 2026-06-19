import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Contact, FolderKanban, FileDown, HelpCircle, ArrowRight } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const modules = [
  {
    title: "Actores",
    description: "Gestión de actores y alianzas estratégicas",
    icon: Building2,
    url: "/actors",
    colorClass: "text-luker-brown",
    bgClass: "bg-luker-brown/10",
  },
  {
    title: "Información de Contacto",
    description: "Directorio de contactos asociados",
    icon: Contact,
    url: "/contacts",
    colorClass: "text-luker-green",
    bgClass: "bg-luker-green/10",
  },
  {
    title: "Programas e iniciativas",
    description: "Seguimiento y estado de programas e iniciativas",
    icon: FolderKanban,
    url: "/projects",
    colorClass: "text-luker-orange",
    bgClass: "bg-luker-orange/10",
  },
  {
    title: "Descarga de Reportes",
    description: "Exportación de datos e informes",
    icon: FileDown,
    url: "/reports",
    colorClass: "text-luker-teal",
    bgClass: "bg-luker-teal/10",
  },
];

const Index = () => {
  const navigate = useNavigate();

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
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Header Banner */}
      <div className="text-center pt-8 pb-4 space-y-4">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-luker-green text-white text-sm font-semibold mb-4">
          Plataforma de Gestión Estratégica
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-heading text-foreground">
          Transformando vidas a través de la <span className="text-luker-green">educación</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
          Sistema centralizado para la gestión de alianzas, actores y programas estratégicos de la Fundación Luker.
        </p>
      </div>

      {/* Modules Grid */}
      <TooltipProvider delayDuration={200}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                className="group cursor-pointer border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate(mod.url)}
              >
                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                  <div className={`rounded-2xl p-4 ${mod.bgClass} group-hover:scale-110 transition-transform duration-300`}>
                    <mod.icon className={`w-8 h-8 ${mod.colorClass}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {mod.description}
                    </p>
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

      {/* Help / Guide Section */}
      <div className="mt-16 pt-8">
        <Card className="border-border bg-gradient-to-br from-background to-muted/30">
          <CardContent className="p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-6">
            <div className="rounded-full bg-luker-orange/10 p-4">
              <HelpCircle className="w-10 h-10 text-luker-orange" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading">¿Necesitas ayuda para navegar la plataforma?</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Consulta nuestra guía de usuario detallada para aprender a utilizar los módulos, 
                gestionar actores y visualizar reportes de manera efectiva.
              </p>
            </div>
            <div className="flex gap-4 mt-4">
              <Button 
                onClick={() => navigate('/guide')}
                className="bg-white text-foreground hover:bg-muted border border-border shadow-sm group"
                variant="outline"
              >
                Ver Guía de Usuario
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
