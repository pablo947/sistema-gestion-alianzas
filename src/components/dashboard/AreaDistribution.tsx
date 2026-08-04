import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EJES, normalizeEje } from '@/lib/ejes';

interface AreaDistributionProps {
  programs: any[];
}

export const AreaDistribution = ({ programs }: AreaDistributionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Eje</CardTitle>
        <CardDescription>
          Programas distribuidos por eje estratégico
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {EJES.map((eje) => {
            const count = programs?.filter(p => normalizeEje(p.eje_estrategico) === eje)?.length || 0;
            const percentage = programs?.length ? Math.round((count / programs.length) * 100) : 0;

            return (
              <div key={eje} className="flex items-center justify-between">
                <span className="text-sm font-medium">{eje}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
