export interface HeatMapData {
  x: number; // interes
  y: number; // influencia
  total: number;
  actores: string[];
  estrategia?: string;
}

export interface HeatMapProps {
  data: HeatMapData[];
}

export interface QuadrantLabel {
  label: string;
  xRange: [number, number];
  yRange: [number, number];
  bg: string;
}

export interface HeatMapCell {
  x: number;
  y: number;
  total: number;
  actores: string[];
  estrategia?: string;
}