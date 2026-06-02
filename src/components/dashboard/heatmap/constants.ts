import { QuadrantLabel } from './types';

export const quadrantLabels: QuadrantLabel[] = [
  {
    label: "Gestionar de cerca",
    xRange: [4, 5],
    yRange: [4, 5],
    bg: "rgba(76, 175, 80, 0.15)" // Verde
  },
  {
    label: "Mantener satisfechos",
    xRange: [1, 2],
    yRange: [4, 5],
    bg: "rgba(255, 152, 0, 0.15)" // Naranja
  },
  {
    label: "Mantener informados",
    xRange: [4, 5],
    yRange: [1, 2],
    bg: "rgba(33, 150, 243, 0.15)" // Azul
  },
  {
    label: "Monitorear",
    xRange: [1, 2],
    yRange: [1, 2],
    bg: "rgba(158, 158, 158, 0.15)" // Gris
  }
];

export const strategyColors = {
  "Gestionar de cerca": "#4CAF50",
  "Mantener satisfechos": "#FF9800", 
  "Mantener informados": "#2196F3",
  "Monitorear": "#9E9E9E"
};