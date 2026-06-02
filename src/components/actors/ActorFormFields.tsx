// Updated form fields for actors - cache refresh
import { ReactNode } from 'react';
import { Control } from 'react-hook-form';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SECTORES_BASE,
  ACADEMICO_SUBSECTORES,
  ALCANCE_TERRITORIAL_OPTIONS,
  PROYECTOS_OPTIONS,
  TIPO_RELACION_OPTIONS,
  NIVEL_OPTIONS,
} from './constants';
import { useProjects } from '@/hooks/useProjects';

const actorSchema = z.object({
  nombre_actor: z.string().min(1, 'El nombre es requerido'),
  sector_actor: z.string().min(1, 'El sector es requerido'),
  ciudad_sede: z.string().default(''),
  alcance_territorial: z.string().default('Municipal'),
  tipo_relacion: z.array(z.string()).default([]),
  anios_alianza: z.array(z.number()).default([]),
  nivel_influencia: z.number().min(1).max(5).optional(),
  nivel_interes: z.number().min(1).max(5).optional(),
  
  proyecto_ids: z.array(z.string()).default([]),
  responsable_seguimiento: z.array(z.string()).default([]),
  telefono_entidad: z.string().default(''),
  direccion_entidad: z.string().default(''),
  correo_entidad: z.string().email('Formato de correo inválido').or(z.literal('')).default(''),
});

type ActorFormData = z.infer<typeof actorSchema>;

interface ActorFormFieldsProps {
  control: Control<ActorFormData>;
  setValue: (name: string, value: any) => void;
  duplicateWarning?: ReactNode;
}

export function ActorFormFields({ control, setValue, duplicateWarning }: ActorFormFieldsProps) {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  
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
      <FormField
        control={control}
        name="nombre_actor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre *</FormLabel>
            <FormControl>
              <Input placeholder="Nombre del actor" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {duplicateWarning}

      <FormField
        control={control}
        name="sector_actor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sector *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sector" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  {SECTORES_BASE.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Académico</SelectLabel>
                  {ACADEMICO_SUBSECTORES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace('Académico — ', '')}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="ciudad_sede"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ciudad Sede</FormLabel>
            <FormControl>
              <Input placeholder="Ciudad donde tiene sede" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="alcance_territorial"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alcance Territorial</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar alcance" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ALCANCE_TERRITORIAL_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="telefono_entidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono de la entidad</FormLabel>
            <FormControl>
              <Input placeholder="PBX o celular institucional" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="direccion_entidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección de la entidad</FormLabel>
            <FormControl>
              <Input placeholder="Dirección de la sede principal" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="correo_entidad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo de la entidad</FormLabel>
            <FormControl>
              <Input type="email" placeholder="correo@entidad.org" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tipo_relacion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipos de Relación</FormLabel>
            <FormControl>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                {TIPO_RELACION_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={field.value?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const currentValue = field.value || [];
                        if (checked) {
                          field.onChange([...currentValue, option]);
                        } else {
                          field.onChange(currentValue.filter(type => type !== option));
                        }
                      }}
                    />
                    <label
                      htmlFor={option}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="anios_alianza"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Años de Alianza Activa</FormLabel>
            <FormControl>
              <div className="border rounded-md p-3">
                <div className="grid grid-cols-5 gap-2">
                  {[2018, 2019, 2020, 2021, 2022].map((year) => (
                    <div key={year} className="flex items-center space-x-1.5">
                      <Checkbox
                        id={`year-${year}`}
                        checked={field.value?.includes(year) || false}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          if (checked) {
                            field.onChange([...currentValue, year].sort());
                          } else {
                            field.onChange(currentValue.filter((y: number) => y !== year));
                          }
                        }}
                      />
                      <label htmlFor={`year-${year}`} className="text-sm cursor-pointer">{year}</label>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[2023, 2024, 2025, 2026].map((year) => (
                    <div key={year} className="flex items-center space-x-1.5">
                      <Checkbox
                        id={`year-${year}`}
                        checked={field.value?.includes(year) || false}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          if (checked) {
                            field.onChange([...currentValue, year].sort());
                          } else {
                            field.onChange(currentValue.filter((y: number) => y !== year));
                          }
                        }}
                      />
                      <label htmlFor={`year-${year}`} className="text-sm cursor-pointer">{year}</label>
                    </div>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="nivel_influencia"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nivel de Influencia/Poder</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel (1-5)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {NIVEL_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="nivel_interes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nivel de Interés</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel (1-5)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {NIVEL_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />


      <FormField
        control={control}
        name="proyecto_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Proyectos Involucrado</FormLabel>
            <FormControl>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {isLoadingProjects ? (
                  <div className="text-sm text-muted-foreground">Cargando proyectos...</div>
                ) : projects && projects.length > 0 ? (
                  projects.map((project: any) => (
                    <div key={project.programa_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={project.programa_id}
                        checked={field.value?.includes(project.programa_id) || false}
                        onCheckedChange={(checked) => {
                          const currentValue = field.value || [];
                          if (checked) {
                            field.onChange([...currentValue, project.programa_id]);
                          } else {
                            field.onChange(currentValue.filter(id => id !== project.programa_id));
                          }
                        }}
                      />
                      <label
                        htmlFor={project.programa_id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {project.nombre}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No hay proyectos disponibles</div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="responsable_seguimiento"
        render={({ field }) => (
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
                      <label
                        htmlFor={member.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
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
        )}
      />
    </>
  );
}