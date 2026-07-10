import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';

interface ActorItem {
  actor_id: string;
  nombre_actor: string;
}

interface StrategicActionDialogProps {
  quadrantKey: string;
  quadrantTitle: string;
  actors: ActorItem[];
  onSuccess?: () => void;
}

export function StrategicActionDialog({
  quadrantKey,
  quadrantTitle,
  actors,
  onSuccess
}: StrategicActionDialogProps) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<'quadrant' | 'actor'>('quadrant');
  const [actorId, setActorId] = useState<string>('');
  const [actionText, setActionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim()) {
      toast({
        title: 'Error',
        description: 'Debe ingresar el texto de la acción estratégica.',
        variant: 'destructive',
      });
      return;
    }
    
    if (scope === 'actor' && !actorId) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un actor.',
        variant: 'destructive',
      });
      return;
    }

    if (!session?.user?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('strategic_actions').insert({
        scope,
        quadrant_key: quadrantKey,
        actor_id: scope === 'actor' ? actorId : null,
        action_text: actionText.trim(),
        created_by: session.user.id,
        user_email: session.user.email || '',
        status: 'pending_approval'
      });

      if (error) throw error;

      toast({
        title: 'Sugerencia enviada',
        description: 'La acción estratégica ha sido enviada a auditoría para su revisión.',
      });
      
      setOpen(false);
      setScope('quadrant');
      setActorId('');
      setActionText('');
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting action:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la sugerencia.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-4 text-xs h-8 border-dashed flex gap-2">
          <PlusCircle className="h-3 w-3" />
          Sugerir acción
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Sugerir Acción Estratégica</DialogTitle>
            <DialogDescription>
              Proponga una nueva acción para el cuadrante <strong>{quadrantTitle}</strong>. 
              Esta sugerencia pasará por un proceso de aprobación.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-3">
              <Label>Alcance de la sugerencia</Label>
              <RadioGroup
                value={scope}
                onValueChange={(val) => setScope(val as 'quadrant' | 'actor')}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quadrant" id="scope-quadrant" />
                  <Label htmlFor="scope-quadrant" className="font-normal cursor-pointer">
                    Para todos los actores de este cuadrante
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="actor" id="scope-actor" />
                  <Label htmlFor="scope-actor" className="font-normal cursor-pointer">
                    Para un actor específico
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {scope === 'actor' && (
              <div className="space-y-2">
                <Label htmlFor="actor">Seleccione el Actor</Label>
                <Select value={actorId} onValueChange={setActorId}>
                  <SelectTrigger id="actor">
                    <SelectValue placeholder="Seleccione un actor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {actors.map((actor) => (
                      <SelectItem key={actor.actor_id} value={actor.actor_id}>
                        {actor.nombre_actor}
                      </SelectItem>
                    ))}
                    {actors.length === 0 && (
                      <SelectItem value="none" disabled>
                        No hay actores en este cuadrante
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="actionText">Acción Estratégica</Label>
              <Textarea
                id="actionText"
                placeholder="Describa la acción estratégica sugerida..."
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                className="min-h-[100px] resize-none text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Sugerencia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
