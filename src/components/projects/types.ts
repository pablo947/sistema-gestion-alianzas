
import type { Eje } from "@/lib/ejes";

export interface Project {
  programa_id: string;
  nombre: string;
  objetivos: string;
  eje_estrategico: Eje;
  area?: string | null;
  actor_id: string | null;
  metas: any;
  avance: any;
  estado: "Planificado" | "Ejecución" | "Finalizado";
  fecha_inicio: string | null;
  fecha_cierre: string | null;
  presupuesto_total: number;
  presupuesto_ejecutado: number;
  created_at: string;
}

export interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSuccess: () => void;
}


export interface IndicadorTecnico {
  id: string;
  codigo: string;
  indicador: string;
  tipo: "gestión" | "impacto" | "resultado";
  areas_reportan: string[];
  meta: string;
  avance: number;
  frecuencia_reporte: "Semanal" | "Mensual" | "Trimestral" | "Semestral" | "Anual";
}

export interface Meta {
  id: string;
  indicador: string;
  meta: string;
  unidad: string;
  avance_actual: number;
  fecha_limite: string;
}
