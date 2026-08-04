
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StackedBarChart } from '@/components/dashboard/StackedBarChart';
import { HeatMap } from '@/components/dashboard/HeatMap';
import { AreaDistribution } from '@/components/dashboard/AreaDistribution';
import { CitiesBarChart } from '@/components/dashboard/CitiesBarChart';
import { ProgramAreaChart } from '@/components/dashboard/ProgramAreaChart';
import { useProgramAreaDistribution } from '@/hooks/useProgramAreaDistribution';
import { useActorCitiesData } from '@/hooks/useActorCitiesData';

interface DashboardChartsProps {
  actorRelations: any[];
  influenceInterest: any[];
  programs: any[];
}

export const DashboardCharts = ({
  actorRelations,
  influenceInterest,
  programs
}: DashboardChartsProps) => {
  const {
    data: programAreaData = []
  } = useProgramAreaDistribution();
  
  const {
    data: citiesData = []
  } = useActorCitiesData();

  return <>
      {/* New Widgets Row - Actor Relations & Influence-Interest Matrix */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Relaciones de Actores</CardTitle>
            <CardDescription>
              Distribución de actores por tipo de relación con la Fundación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StackedBarChart data={actorRelations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matriz Influencia–Interés</CardTitle>
            <CardDescription>
              Heat-map 5×5 de actores por nivel de influencia e interés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HeatMap data={influenceInterest} />
          </CardContent>
        </Card>
      </div>

      {/* Cities Distribution Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actores por Municipio de Actuación</CardTitle>
            <CardDescription>
              Distribución de actores según sus municipios de actuación (top 10)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CitiesBarChart data={citiesData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Programas por Eje</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgramAreaChart data={programAreaData} />
          </CardContent>
        </Card>
      </div>

      {/* Area Distribution */}
      <div className="grid gap-4 md:grid-cols-1">
        
      </div>
    </>;
};
