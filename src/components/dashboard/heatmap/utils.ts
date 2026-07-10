import { QuadrantLabel } from './types';
import { quadrantLabels, strategyColors } from './constants';

export const getCellStyles = (value: number, x: number, y: number): string => {
  if (value === 0) return 'bg-white border border-gray-100 text-gray-400 opacity-60';

  const strategy = getStrategyForCell(x, y);
  
  if (strategy === 'Gestionar de cerca') {
    return 'bg-green-50 text-green-600 border border-green-100/50';
  }
  if (strategy === 'Mantener satisfechos') {
    return 'bg-blue-50 text-blue-600 border border-blue-100/50';
  }
  if (strategy === 'Mantener informados') {
    return 'bg-orange-50 text-orange-600 border border-orange-100/50';
  }
  if (strategy === 'Monitorear') {
    return 'bg-gray-50 text-gray-600 border border-gray-200/50';
  }
  
  // Transitions (x=3 or y=3)
  return 'bg-slate-50 text-slate-500 border border-slate-100';
};

const getStrategyForCell = (x: number, y: number): string => {
  if (y >= 4 && x >= 4) return 'Gestionar de cerca';
  if (y <= 2 && x >= 4) return 'Mantener satisfechos';
  if (y >= 4 && x <= 2) return 'Mantener informados';
  return 'Monitorear';
};

export const getQuadrantForCell = (x: number, y: number): QuadrantLabel | null => {
  return quadrantLabels.find(quad => 
    x >= quad.xRange[0] && x <= quad.xRange[1] && 
    y >= quad.yRange[0] && y <= quad.yRange[1]
  ) || null;
};