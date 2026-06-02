
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CitiesData {
  city: string;
  count: number;
  actors: string[];
}

interface CitiesBarChartProps {
  data: CitiesData[];
}

export const CitiesBarChart = ({ data }: CitiesBarChartProps) => {
  const navigate = useNavigate();

  // Generate different colors for each bar
  const generateColors = (count: number) => {
    const colors = [];
    const hues = [];
    
    // Generate evenly distributed hues
    for (let i = 0; i < count; i++) {
      hues.push((i * 360) / count);
    }
    
    return hues.map(hue => ({
      background: `hsl(${hue}, 65%, 55%)`,
      border: `hsl(${hue}, 65%, 45%)`
    }));
  };

  const colors = generateColors(data.length);

  const chartData = {
    labels: data.map(item => item.city),
    datasets: [
      {
        label: 'Número de Actores',
        data: data.map(item => item.count),
        backgroundColor: colors.map(c => c.background),
        borderColor: colors.map(c => c.border),
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const cityName = data[index].city;
        navigate(`/actors?municipioActuacion=${encodeURIComponent(cityName)}`);
        toast({
          title: "Filtro aplicado",
          description: `Mostrando actores de: ${cityName}`,
        });
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const cityData = data[context.dataIndex];
            return cityData.actors.length > 3 
              ? cityData.actors.slice(0, 3).concat(['...'])
              : cityData.actors;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          callback: function(value: any, index: number) {
            const label = this.getLabelForValue(value);
            return label.length > 12 ? label.substring(0, 12) + '...' : label;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', cursor: 'pointer' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};
