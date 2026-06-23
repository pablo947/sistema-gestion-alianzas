import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ChangeRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actorId: string;
  payload: any;
  onSuccess?: () => void;
}

export function ChangeRequestDialog({ open, onOpenChange, actorId, payload, onSuccess }: ChangeRequestDialogProps) {
  const [justification, setJustification] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('actor_change_requests')
        .insert({
          actor_id: actorId,
          requested_by: user?.id,
          user_email: user?.email,
          payload,
          justification,
          status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Solicitud enviada',
        description: 'La solicitud de modificación ha sido enviada al administrador para su revisión.',
      });
      queryClient.invalidateQueries({ queryKey: ['pending-change-requests'] });
      setJustification('');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error al enviar solicitud',
        description: 'Hubo un problema al enviar la solicitud. Por favor intenta de nuevo.',
      });
      console.error(error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Revisión de Cambios</DialogTitle>
          <DialogDescription>
            Has realizado modificaciones a este actor. Por favor, justifica brevemente los cambios solicitados para que un administrador los revise y apruebe.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Ej: Se actualizó el número de teléfono y el sector de actuación..."
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !justification.trim()} className="bg-orange-600 hover:bg-orange-700">
            {mutation.isPending ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
