import { HeatMapCell } from './types';
import { HeatMapTooltip } from './HeatMapTooltip';

interface HeatMapGridProps {
  grid: HeatMapCell[][];
  maxValue: number;
  highlightedCell: { x: number; y: number } | null;
  hoveredCell: { x: number; y: number } | null;
  onCellClick: (cell: { x: number; y: number }) => void;
  onCellHover: (cell: { x: number; y: number } | null) => void;
  getQuadrantForCell: (x: number, y: number) => any;
  getCellStyles: (value: number, x: number, y: number) => string;
}

export const HeatMapGrid = ({ 
  grid, 
  maxValue, 
  highlightedCell, 
  hoveredCell,
  onCellClick, 
  onCellHover,
  getQuadrantForCell, 
  getCellStyles 
}: HeatMapGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-3 w-full max-w-lg mx-auto">
      {grid.map((row, rowIndex) => 
        row.map((cell, colIndex) => {
          const quadrant = getQuadrantForCell(cell.x, cell.y);
          const isHighlighted = highlightedCell?.x === 5 && highlightedCell?.y === 5 && quadrant?.label === "Gestionar de cerca";
          
          return (
            <div 
              key={`${cell.x}-${cell.y}`} 
              className={`
                relative aspect-square rounded-xl cursor-pointer
                transition-all duration-200 ease-in-out
                hover:shadow-md hover:-translate-y-1
                ${isHighlighted ? 'ring-2 ring-primary ring-offset-2' : ''}
                ${getCellStyles(cell.total, cell.x, cell.y)}
              `} 
              onClick={() => onCellClick(cell)} 
              onMouseEnter={() => onCellHover({ x: cell.x, y: cell.y })} 
              onMouseLeave={() => onCellHover(null)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold drop-shadow-sm">
                  {cell.total > 0 ? cell.total : ''}
                </span>
              </div>
              <HeatMapTooltip cell={cell} hoveredCell={hoveredCell} />
            </div>
          );
        })
      )}
    </div>
  );
};