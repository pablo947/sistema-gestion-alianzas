
export interface LugarActuacion {
  departamento: string;
  municipios: string[];
}

export interface Actor {
  actor_id: string;
  nombre_actor: string;
  sector_actor: string;
  ciudad_sede: string;
  alcance_territorial: string;
  tipo_relacion: string[];
  nivel_influencia: number;
  nivel_interes: number;
  estado_relacion: string;
  responsable_seguimiento: string[];
  telefono_entidad?: string;
  direccion_entidad?: string;
  correo_entidad?: string;
  departamento_actuacion?: string[];
  municipio_actuacion?: string[];
}

export interface ActorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actor?: Actor | null;
  onSuccess: () => void;
}
