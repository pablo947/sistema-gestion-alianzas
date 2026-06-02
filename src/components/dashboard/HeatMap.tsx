import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { HeatMapProps, HeatMapData } from './heatmap/types';
import { quadrantLabels } from './heatmap/constants';
import { QuadrantOverlays } from './heatmap/QuadrantOverlays';
import { HeatMapGrid } from './heatmap/HeatMapGrid';
import { HeatMapAxis } from './heatmap/HeatMapAxis';
import { getColorIntensity, getColorByStrategy, getQuadrantForCell } from './heatmap/utils';

export function HeatMap({ data }: HeatMapProps) {
  console.log('HeatMap data received:', data);
  const navigate = useNavigate();
  const [highlightedCell, setHighlightedCell] = useState<{ x: number; y: number } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  // Create 5x5 grid
  const gridSize = 5;
  const grid = Array.from({ length: gridSize }, (_, y) =>
    Array.from({ length: gridSize }, (_, x) => {
      const cellData = data.find(d => d.x === x + 1 && d.y === gridSize - y);
      return {
        x: x + 1,
        y: gridSize - y,
        total: cellData?.total || 0,
        actores: cellData?.actores || [],
        estrategia: cellData?.estrategia
      };
    })
  );

  // Get max value for color scaling
  const maxValue = Math.max(...data.map(d => d.total), 1);

  const handleCellClick = (cell: { x: number; y: number }) => {
    navigate(`/actors?influencia=${cell.y}&interes=${cell.x}`);
    toast({
      title: "Filtro aplicado",
      description: "¡Manos a la obra con esos actores!"
    });
  };

  const highlightQuadrant = (xRange: number, yRange: number) => {
    setHighlightedCell({ x: xRange, y: yRange });
    const quadrant = quadrantLabels.find(q => q.xRange[1] === xRange && q.yRange[1] === yRange);
    if (quadrant) {
      toast({
        title: "Cuadrante resaltado",
        description: quadrant.label
      });
    }
  };

  const clearFilters = () => {
    setHighlightedCell(null);
    toast({
      title: "Filtros limpiados",
      description: "Vista general restaurada"
    });
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'q' || event.key === 'Q') {
      highlightQuadrant(5, 5);
    } else if (event.key === 'Escape') {
      clearFilters();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="relative">
      {/* Heat Map Grid with Quadrant Backgrounds */}
      <div className="relative">
        <QuadrantOverlays gridSize={gridSize} />
        
        <HeatMapGrid
          grid={grid}
          maxValue={maxValue}
          highlightedCell={highlightedCell}
          hoveredCell={hoveredCell}
          onCellClick={handleCellClick}
          onCellHover={setHoveredCell}
          getQuadrantForCell={getQuadrantForCell}
          getColorIntensity={(value, x, y) => getColorByStrategy(x, y, value)}
        />

        <HeatMapAxis gridSize={gridSize} />
      </div>
    </div>
  );
}