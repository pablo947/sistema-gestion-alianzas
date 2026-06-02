interface HeatMapAxisProps {
  gridSize: number;
}

export const HeatMapAxis = ({ gridSize }: HeatMapAxisProps) => {
  return (
    <>
      {/* Axis Labels */}
      <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
        <span className="text-sm font-medium text-muted-foreground">Nivel de Interés →</span>
      </div>
      <div className="absolute -left-20 top-0 bottom-0 flex items-center">
        <span className="text-sm font-medium text-muted-foreground transform -rotate-90">← Nivel de Influencia</span>
      </div>
      
      {/* Axis Numbers */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
        <div className="grid grid-cols-5 gap-2 w-full max-w-lg">
          {[1, 2, 3, 4, 5].map(num => (
            <div key={num} className="text-center text-xs text-muted-foreground font-medium">
              {num}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-center">
        <div className="grid grid-rows-5 gap-2 h-full max-h-lg">
          {[5, 4, 3, 2, 1].map(num => (
            <div key={num} className="flex items-center text-xs text-muted-foreground font-medium">
              {num}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};