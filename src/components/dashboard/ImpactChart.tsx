import { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BubbleDataPoint } from 'chart.js';
import { Bubble } from 'react-chartjs-2';
import { EJES, normalizeEje } from '@/lib/ejes';

ChartJS.register(CategoryScale, LinearScale, PointElement);

interface Project {
  eje_estrategico?: string | null;
  estado?: string | null;
}

interface ImpactChartProps {
  projects: Project[];
}

const EJE_COLORS: Record<string, string> = {
  'Primera Infancia': 'rgba(236, 72, 153, 0.6)',
  'Educación en el Aula': 'rgba(59, 130, 246, 0.6)',
  'Jóvenes y dinámicas más allá del aula': 'rgba(99, 102, 241, 0.6)',
  'Vida productiva': 'rgba(16, 185, 129, 0.6)',
  'Organizaciones e Iniciativas del Legado': 'rgba(168, 85, 247, 0.6)',
  'Conocimiento e Incidencia': 'rgba(6, 182, 212, 0.6)',
};

export function ImpactChart({ projects }: ImpactChartProps) {
  const chartRef = useRef();

  const data = {
    datasets: EJES.map((eje) => {
      const ejeProjects = projects.filter(p => normalizeEje(p.eje_estrategico) === eje);
      const completed = ejeProjects.filter(p => p.estado === 'Finalizado').length;
      const total = ejeProjects.length;
      const impact = Math.random() * 80 + 20;
      const progress = total > 0 ? (completed / total) * 100 : 0;
      const color = EJE_COLORS[eje];

      return {
        label: eje,
        data: [{
          x: progress,
          y: impact,
          r: Math.max(total * 3, 8),
        }] as BubbleDataPoint[],
        backgroundColor: color,
        borderColor: color.replace('0.6', '1'),
        borderWidth: 2,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bubble ref={chartRef} data={data} options={options} />
    </div>
  );
}
