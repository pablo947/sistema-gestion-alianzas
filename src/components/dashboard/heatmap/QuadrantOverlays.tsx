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
            className="absolute pointer-events-none" 
            style={{
              left: `${Math.max(5, Math.min(95, centerX))}%`,
              top: `${Math.max(5, Math.min(95, centerY))}%`,
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Arial, sans-serif',
              fontSize: '10pt',
              fontWeight: '500',
              color: 'rgba(0, 0, 0, 0.35)',
              textShadow: '1px 1px 2px rgba(255,255,255,0.6)',
              lineHeight: '1.1',
              textAlign: 'center',
              maxWidth: '80px',
              zIndex: 10,
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