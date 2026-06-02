
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface StackedBarData {
  label: string;
  stack: string;
  total: number;
}

interface StackedBarChartProps {
  data: StackedBarData[];
}

const COLOR_MAP: { [key: string]: string } = {
  'Donante': '#004FA3',
  'Beneficiario': '#26B4E1', 
  'Socio Comercial': '#A6DCEF',
  'Co-Implementador': '#FDB813'
};

export function StackedBarChart({ data }: StackedBarChartProps) {
  const navigate = useNavigate();

  const handleClick = (data: any) => {
    if (data && data.label) {
      navigate(`/actors?tipoRelacion=${encodeURIComponent(data.label)}`);
      toast({
        title: "Filtro aplicado",
        description: `Mostrando actores con relación: ${data.label}`,
      });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0]?.value || 0;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">
            <span style={{ color: payload[0]?.color }}>●</span>
            {' '}{value} {value === 1 ? 'actor' : 'actores'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="label" 
          stroke="hsl(var(--muted-foreground))"
          angle={-35}
          textAnchor="end"
          height={80}
          interval={0}
          fontSize={11}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="total"
          onClick={handleClick}
          className="cursor-pointer transition-all duration-300 ease-in-out hover:opacity-80"
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLOR_MAP[entry.label] || `hsl(${(index * 60) % 360}, 70%, 50%)`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
