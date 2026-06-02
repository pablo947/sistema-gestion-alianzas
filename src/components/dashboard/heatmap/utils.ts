import { QuadrantLabel } from './types';
import { quadrantLabels, strategyColors } from './constants';

export const getColorIntensity = (value: number, maxValue: number): string => {
  if (value === 0) return '#f8f9fa';

  const intensity = Math.min(value / maxValue, 1);

  if (intensity < 0.2) return '#E3F2FD';
  if (intensity < 0.4) return '#BBDEFB';
  if (intensity < 0.6) return '#64B5F6';
  if (intensity < 0.8) return '#2196F3';
  return '#1565C0';
};

export const getColorByStrategy = (x: number, y: number, value: number): string => {
  if (value === 0) return '#f8f9fa';

  const strategy = getStrategyForCell(x, y);
  const baseColor = strategyColors[strategy];
  
  // Para celdas en transición (valores x=3 o y=3), mezclar colores
  if (x === 3 || y === 3) {
    return mixTransitionColors(x, y, baseColor);
  }
  
  return baseColor;
};

const getStrategyForCell = (x: number, y: number): string => {
  if (y >= 4 && x >= 4) return 'Gestionar de cerca';
  if (y <= 2 && x >= 4) return 'Mantener satisfechos';
  if (y >= 4 && x <= 2) return 'Mantener informados';
  return 'Monitorear';
};

const mixTransitionColors = (x: number, y: number, baseColor: string): string => {
  // Para simplificar, retornamos una versión más clara del color base en transiciones
  const alpha = '80'; // Más transparente en transiciones
  const hex = baseColor.replace('#', '');
  return `${baseColor}${alpha}`;
};

export const getQuadrantForCell = (x: number, y: number): QuadrantLabel | null => {
  return quadrantLabels.find(quad => 
    x >= quad.xRange[0] && x <= quad.xRange[1] && 
    y >= quad.yRange[0] && y <= quad.yRange[1]
  ) || null;
};