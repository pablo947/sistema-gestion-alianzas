
import { Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectAreaData {
  eje?: string;
  area?: string;
  count: number;
  projects: string[];
}

interface ProjectAreaChartProps {
  data: ProjectAreaData[];
}

export const ProjectAreaChart = ({ data }: ProjectAreaChartProps) => {
  const navigate = useNavigate();

  // Generate different colors for each area
  const generateColors = (count: number) => {
    const colors = [];
    const hues = [];
    
    // Generate evenly distributed hues
    for (let i = 0; i < count; i++) {
      hues.push((i * 360) / count);
    }
    
    return hues.map(hue => ({
      background: `hsl(${hue}, 65%, 60%)`,
      border: `hsl(${hue}, 65%, 50%)`
    }));
  };

  const colors = generateColors(data.length);

  const chartData = {
    labels: data.map(item => item.eje || item.area || ''),
    datasets: [
      {
        label: 'Número de Proyectos',
        data: data.map(item => item.count),
        backgroundColor: colors.map(c => c.background),
        borderColor: colors.map(c => c.border),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const ejeName = data[index].eje || data[index].area || '';
        navigate(`/projects?eje=${encodeURIComponent(ejeName)}`);
        toast({
          title: "Filtro aplicado",
          description: `Mostrando proyectos del eje: ${ejeName}`,
        });
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const item = data[context.dataIndex];
            return item.projects.length > 3
              ? item.projects.slice(0, 3).concat(['...'])
              : item.projects;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', cursor: 'pointer' }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};
