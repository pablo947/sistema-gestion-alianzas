export const REDES_ALUMNI_OPTIONS = [
  'Nido: Laboratorio de Liderazgo',
  'Team Impacto Colectivo',
  'Ecosistema Manizales Más',
] as const;

export const NIVELES_DIRECCION = [
  'Estratégico',
  'Directivo',
  'Mando Medio',
  'Operativo',
  'Asesor',
  'Responsable de Comunicaciones',
  'Sin clasificar',
] as const;

export type NivelDireccion = typeof NIVELES_DIRECCION[number];

export interface Contact {
  contact_id: string;
  nombre: string;
  apellidos: string;
  actor_id: string;
  cargo: string;
  correo: string;
  telefono: string;
  ciudad: string;
  tipo_contacto?: string[];
  responsable_seguimiento: string[];
  notas: string;
  updated_at: string;
  nivel_direccion?: NivelDireccion | null;
  nivel_direccion_auto?: boolean;
}

export interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSuccess: () => void;
  preselectedActorId?: string;
}