import { ReactNode, useEffect, useRef } from 'react';
import { Control, useWatch, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { REDES_ALUMNI_OPTIONS, NIVELES_DIRECCION } from './types';

const contactSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidos: z.string().default(''),
  actor_id: z.string().min(1, 'Debe seleccionar un actor'),
  cargo: z.string().default(''),
  correo: z.string().email('Email inválido').or(z.literal('')),
  telefono: z.string().default(''),
  ciudad: z.string().default(''),
  tipo_contacto: z.array(z.string()).default([]),
  responsable_seguimiento: z.array(z.string()).default([]),
  nivel_direccion: z.string().default('Sin clasificar'),
  nivel_direccion_auto: z.boolean().default(true),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormFieldsProps {
  control: Control<ContactFormData>;
  preselectedActorId?: string;
  duplicateWarning?: ReactNode;
}

export function ContactFormFields({ control, preselectedActorId, duplicateWarning }: ContactFormFieldsProps) {
  const formCtx = useFormContext();
  const { data: actors = [] } = useQuery({
    queryKey: ['actors-with-sector'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('actors')
        .select('actor_id, nombre_actor, sector_actor')
        .order('nombre_actor');
      if (error) throw error;
      return data;
    }
  });

  const selectedActorId = useWatch({ control, name: 'actor_id' });
  const selectedActor = actors.find((a: any) => a.actor_id === selectedActorId);
  const cargoValue = useWatch({ control, name: 'cargo' });
  const nivelAuto = useWatch({ control, name: 'nivel_direccion_auto' });
  const lastSuggestRef = useRef<string>('');

  // Auto-suggest nivel_direccion when cargo or actor sector changes, only if user hasn't overridden
  useEffect(() => {
    if (!nivelAuto) return;
    const cargo = (cargoValue || '').trim();
    const sector = selectedActor?.sector_actor || null;
    const key = `${cargo}|${sector || ''}`;
    if (!cargo) return;
    if (key === lastSuggestRef.current) return;
    lastSuggestRef.current = key;
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any).rpc('sugerir_nivel_direccion', { _cargo: cargo, _sector: sector });
      if (!cancelled && !error && data) {
        formCtx.setValue('nivel_direccion', data, { shouldDirty: false });
      }
    })();
    return () => { cancelled = true; };
  }, [cargoValue, selectedActor?.sector_actor, nivelAuto, formCtx]);

  const { data: teamMembers = [], isLoading: isLoadingTeam } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, nombre, apellidos')
        .order('nombre');
      if (error) throw error;
      return data;
    }
  });

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={control} name="nombre" render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl><Input placeholder="Nombre del contacto" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={control} name="apellidos" render={({ field }) => (
            <FormItem>
              <FormLabel>Apellidos</FormLabel>
              <FormControl><Input placeholder="Apellidos del contacto" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        {duplicateWarning}
      </div>

      <FormField control={control} name="actor_id" render={({ field }) => (
        <FormItem>
          <FormLabel>Actor Representado *</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!preselectedActorId}>
            <FormControl>
              <SelectTrigger><SelectValue placeholder="Seleccionar actor" /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {actors.map((actor: any) => (
                <SelectItem key={actor.actor_id} value={actor.actor_id}>{actor.nombre_actor}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedActor?.sector_actor && (
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span>Sector heredado:</span>
              <Badge variant="secondary" className="font-normal">{selectedActor.sector_actor}</Badge>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="cargo" render={({ field }) => (
        <FormItem>
          <FormLabel>Cargo</FormLabel>
          <FormControl><Input placeholder="Cargo o posición" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="nivel_direccion" render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            Nivel de dirección
            {nivelAuto && (
              <Badge variant="secondary" className="font-normal gap-1">
                <Sparkles className="h-3 w-3" />
                Sugerencia automática
              </Badge>
            )}
          </FormLabel>
          <Select
            value={field.value || 'Sin clasificar'}
            onValueChange={(value) => {
              field.onChange(value);
              formCtx.setValue('nivel_direccion_auto', false, { shouldDirty: true });
            }}
          >
            <FormControl>
              <SelectTrigger><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {NIVELES_DIRECCION.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground pt-1">
            Se sugiere automáticamente según el cargo y el sector del actor. Puedes editarlo si la sugerencia no aplica.
          </p>
          <FormMessage />
        </FormItem>
      )} />



      <FormField control={control} name="correo" render={({ field }) => (
        <FormItem>
          <FormLabel>Correo</FormLabel>
          <FormControl><Input placeholder="correo@ejemplo.com" type="email" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="telefono" render={({ field }) => (
        <FormItem>
          <FormLabel>Teléfono</FormLabel>
          <FormControl><Input placeholder="+57 300 123 4567" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="ciudad" render={({ field }) => (
        <FormItem>
          <FormLabel>Ciudad</FormLabel>
          <FormControl><Input placeholder="Ciudad de residencia" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="tipo_contacto" render={({ field }) => (
        <FormItem>
          <FormLabel>Red Alumni</FormLabel>
          <FormControl>
            <div className="space-y-2 border rounded-md p-3">
              {REDES_ALUMNI_OPTIONS.map((red) => (
                <div key={red} className="flex items-center space-x-2">
                  <Checkbox
                    id={`red-${red}`}
                    checked={field.value?.includes(red) || false}
                    onCheckedChange={(checked) => {
                      const current = field.value || [];
                      if (checked) {
                        field.onChange([...current, red]);
                      } else {
                        field.onChange(current.filter((r: string) => r !== red));
                      }
                    }}
                  />
                  <label htmlFor={`red-${red}`} className="text-sm font-medium leading-none cursor-pointer">
                    {red}
                  </label>
                </div>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />

      <FormField control={control} name="responsable_seguimiento" render={({ field }) => (
        <FormItem>
          <FormLabel>Responsable de Seguimiento</FormLabel>
          <FormControl>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {isLoadingTeam ? (
                <div className="text-sm text-muted-foreground">Cargando equipo...</div>
              ) : teamMembers && teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.id}
                      checked={field.value?.includes(member.id) || false}
                      onCheckedChange={(checked) => {
                        const currentValue = field.value || [];
                        if (checked) {
                          field.onChange([...currentValue, member.id]);
                        } else {
                          field.onChange(currentValue.filter(id => id !== member.id));
                        }
                      }}
                    />
                    <label htmlFor={member.id} className="text-sm font-medium leading-none cursor-pointer">
                      {member.nombre} {member.apellidos}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No hay miembros del equipo disponibles</div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  );
}
