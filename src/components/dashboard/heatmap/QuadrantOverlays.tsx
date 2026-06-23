import { quadrantLabels } from './constants';

interface QuadrantOverlaysProps {
  gridSize: number;
}

export const QuadrantOverlays = ({ gridSize }: QuadrantOverlaysProps) => {
  return (
    <>
      {/* Quadrant Labels - positioned relative to grid cells */}
      {quadrantLabels.map((quadrant, index) => {
        // Calculate center position more precisely within grid bounds
        const centerX = ((quadrant.xRange[0] + quadrant.xRange[1]) / 2 - 0.5) * (100 / gridSize);
        const centerY = (gridSize - (quadrant.yRange[0] + quadrant.yRange[1]) / 2 + 0.5) * (100 / gridSize);
        
        return (
          <div 
            key={index} 
            className="absolute pointer-events-none text-muted-foreground/40 font-bold" 
            style={{
              left: `${Math.max(5, Math.min(95, centerX))}%`,
              top: `${Math.max(5, Math.min(95, centerY))}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: '0.9rem',
              lineHeight: '1.2',
              textAlign: 'center',
              maxWidth: '80px',
              zIndex: 0,
              wordBreak: 'break-word'
            }}
          >
            {quadrant.label}
          </div>
        );
      })}
    </>
  );
};