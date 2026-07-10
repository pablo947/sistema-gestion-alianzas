import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ContactFormFields } from './ContactFormFields';
import { Contact, ContactDialogProps } from './types';
import { Trash } from 'lucide-react';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import { DuplicateWarning } from '@/components/DuplicateWarning';
import { sanitizeFormData } from '@/lib/textUtils';
import { usePermissions } from '@/hooks/usePermissions';
import { ContactChangeRequestDialog } from './ContactChangeRequestDialog';

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

export function ContactDialog({ open, onOpenChange, contact, onSuccess, preselectedActorId }: ContactDialogProps) {
  const [acknowledgedDuplicateSignature, setAcknowledgedDuplicateSignature] = useState<string | null>(null);
  const [changeRequestPayload, setChangeRequestPayload] = useState<any>(null);
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const duplicateWarningRef = useRef<HTMLDivElement>(null);
  const { canEditContacts, canDeleteContacts } = usePermissions();
  const { data: allContacts = [] } = useQuery({
    queryKey: ['contacts-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('contact_id, nombre, apellidos, correo');
      if (error) throw error;
      return data || [];
    }
  });

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      nombre: '',
      apellidos: '',
      actor_id: '',
      cargo: '',
      correo: '',
      telefono: '',
      ciudad: '',
      tipo_contacto: [],
      responsable_seguimiento: [],
      nivel_direccion: 'Sin clasificar',
      nivel_direccion_auto: true,
    },
  });

  const contactNameValue = form.watch('nombre');
  const contactLastNameValue = form.watch('apellidos');
  const contactEmailValue = form.watch('correo');
  const fullName = `${contactNameValue} ${contactLastNameValue}`.trim();
  const duplicates = useDuplicateDetection(
    fullName,
    allContacts.map(c => ({ id: c.contact_id, name: `${c.nombre} ${c.apellidos || ''}`.trim(), email: c.correo })),
    contact?.contact_id,
    contactEmailValue
  );
  const duplicateSignature = useMemo(
    () => `${fullName}|${contactLastNameValue}|${contactEmailValue}|${duplicates.map(d => d.id).join(',')}`,
    [fullName, contactLastNameValue, contactEmailValue, duplicates]
  );
  const hasDuplicates = duplicates.length > 0 && !contact && acknowledgedDuplicateSignature !== duplicateSignature;

  // Reset form when contact changes
  useEffect(() => {
    setAcknowledgedDuplicateSignature(null);
    if (contact) {
      form.reset({
        nombre: contact.nombre || '',
        apellidos: contact.apellidos || '',
        actor_id: contact.actor_id || '',
        cargo: contact.cargo || '',
        correo: contact.correo || '',
        telefono: contact.telefono || '',
        ciudad: contact.ciudad || '',
        tipo_contacto: Array.isArray(contact.tipo_contacto) ? contact.tipo_contacto : [],
        responsable_seguimiento: Array.isArray(contact.responsable_seguimiento) ? contact.responsable_seguimiento : [],
        nivel_direccion: (contact as any).nivel_direccion || 'Sin clasificar',
        nivel_direccion_auto: (contact as any).nivel_direccion_auto ?? true,
      });
    } else {
      form.reset({
        nombre: '',
        apellidos: '',
        actor_id: preselectedActorId || '',
        cargo: '',
        correo: '',
        telefono: '',
        ciudad: '',
        tipo_contacto: [],
        responsable_seguimiento: [],
        nivel_direccion: 'Sin clasificar',
        nivel_direccion_auto: true,
      });
    }
  }, [contact, preselectedActorId, open, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof contactSchema>) => {
      const sanitized = sanitizeFormData(values);
      const contactData = {
        nombre: sanitized.nombre,
        apellidos: sanitized.apellidos,
        actor_id: sanitized.actor_id,
        cargo: sanitized.cargo,
        correo: sanitized.correo,
        telefono: sanitized.telefono,
        ciudad: sanitized.ciudad,
        tipo_contacto: sanitized.tipo_contacto,
        responsable_seguimiento: sanitized.responsable_seguimiento,
        nivel_direccion: (values.nivel_direccion || 'Sin clasificar') as any,
        nivel_direccion_auto: values.nivel_direccion_auto ?? true,
        notas: '',
      };

      if (contact) {
        // This is never reached directly if we intercept in onSubmit, but keeping it for safety
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('contact_id', contact.contact_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert({
            ...contactData,
            status: 'pending_approval'
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!contact) return;
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('contact_id', contact.contact_id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado exitosamente.",
      });
      onSuccess();
    },
  });

  const onSubmit = (values: z.infer<typeof contactSchema>) => {
    if (hasDuplicates) {
      duplicateWarningRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast({
        title: 'Revisa la coincidencia detectada',
        description: 'Puedes continuar con la creación de todos modos desde la alerta del formulario.',
      });
      return;
    }

    if (contact) {
      setChangeRequestPayload(values);
      setIsChangeRequestOpen(true);
      return;
    }

    mutation.mutate(values);
  };

  const handleDelete = () => {
    if (contact) {
      deleteMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto pb-6">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Editar Contacto' : 'Nuevo Contacto'}
          </DialogTitle>
          <DialogDescription>
            {contact 
              ? 'Modifica la información del contacto.'
              : 'Agrega un nuevo contacto al sistema.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
            <ContactFormFields
              control={form.control}
              preselectedActorId={preselectedActorId}
              duplicateWarning={hasDuplicates ? (
                <div ref={duplicateWarningRef}>
                  <DuplicateWarning
                    duplicates={duplicates}
                    entityType="contact"
                    onViewExisting={(id) => window.open(`/contacts?contactId=${id}`, '_blank', 'noopener,noreferrer')}
                    onAcknowledge={() => setAcknowledgedDuplicateSignature(duplicateSignature)}
                  />
                </div>
              ) : null}
            />

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
              {contact && canDeleteContacts() && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="min-h-10 btn-animate"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              )}
              <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="min-h-10"
                >
                  {canEditContacts() ? 'Cancelar' : 'Cerrar'}
                </Button>
                {canEditContacts() && (
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className={contact ? "bg-orange-600 hover:bg-orange-700 text-white min-h-10" : "min-h-10 btn-animate"}
                  >
                    {contact ? 'Enviar solicitud de actualización' : 'Crear Contacto'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
        {contact && (
          <ContactChangeRequestDialog
            open={isChangeRequestOpen}
            onOpenChange={setIsChangeRequestOpen}
            contactId={contact.contact_id}
            payload={changeRequestPayload}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}