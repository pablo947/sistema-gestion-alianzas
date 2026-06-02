import { HeatMapCell } from './types';

interface HeatMapTooltipProps {
  cell: HeatMapCell;
  hoveredCell: { x: number; y: number } | null;
}

export const HeatMapTooltip = ({ cell, hoveredCell }: HeatMapTooltipProps) => {
  if (!hoveredCell || hoveredCell.x !== cell.x || hoveredCell.y !== cell.y) return null;
  
  return (
    <div 
      className="fixed z-[999] bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs pointer-events-none"
      style={{
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'normal',
        minWidth: '160px'
      }}
    >
      <div className="text-sm font-semibold text-foreground mb-1">
        {cell.total} {cell.total === 1 ? 'actor' : 'actores'}
      </div>
      
      {cell.estrategia && (
        <div className="text-xs text-primary font-medium bg-primary/5 px-2 py-1 rounded">
          {cell.estrategia}
        </div>
      )}
      
      {cell.total === 0 && (
        <div className="text-xs text-muted-foreground italic">
          Sin actores en esta posición
        </div>
      )}
    </div>
  );
};
