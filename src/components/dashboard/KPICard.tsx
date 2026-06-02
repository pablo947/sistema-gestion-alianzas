
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  trend?: number;
  suffix?: string;
  onClick?: () => void;
}

export function KPICard({ title, value, description, icon: Icon, trend, suffix = '', onClick }: KPICardProps) {
  const isPositiveTrend = trend && trend > 0;
  
  return (
    <Card 
      className={`btn-animate hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString()}{suffix}
        </div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <span>{description}</span>
          {trend && (
            <div className={`flex items-center ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveTrend ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
