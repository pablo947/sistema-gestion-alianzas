import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';

interface ActorItem {
  actor_id: string;
  nombre_actor: string;
}

interface StrategicActionDialogProps {
  quadrantKey?: string;
  quadrantTitle?: string;
  actors?: ActorItem[];
  
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  
  defaultScope?: 'quadrant' | 'actor';
  defaultActorId?: string;
  lockedActor?: boolean;
  showTrigger?: boolean;
  
  onSuccess?: () => void;
}

export function StrategicActionDialog({
  quadrantKey = 'unknown',
  quadrantTitle = '',
  actors = [],
  open: externalOpen,
  onOpenChange: setExternalOpen,
  defaultScope = 'quadrant',
  defaultActorId = '',
  lockedActor = false,
  showTrigger = true,
  onSuccess
}: StrategicActionDialogProps) {
  const { session, isAdmin } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? setExternalOpen! : setInternalOpen;

  const [scope, setScope] = useState<'quadrant' | 'actor'>(defaultScope);
  const [actorId, setActorId] = useState<string>(defaultActorId);
  const [actionText, setActionText] = useState('');
  
  const [directrices, setDirectrices] = useState('');
  const [exigencias, setExigencias] = useState(false);
  const [detallesExigencias, setDetallesExigencias] = useState('');
  const [criticidad, setCriticidad] = useState('');
  const [responsable, setResponsable] = useState('');
  const [fechaRevision, setFechaRevision] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setScope(defaultScope);
      setActorId(defaultActorId);
      setActionText('');
      setDirectrices('');
      setExigencias(false);
      setDetallesExigencias('');
      setCriticidad('');
      setResponsable('');
      setFechaRevision('');
    }
  }, [open, defaultScope, defaultActorId]);

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
      const status = isAdmin ? 'approved' : 'pending_approval';

      const { error } = await supabase.from('strategic_actions').insert({
        scope,
        quadrant_key: quadrantKey,
        actor_id: scope === 'actor' ? actorId : null,
        action_text: actionText.trim(),
        
        directrices_trato: directrices || null,
        exigencias_contractuales: exigencias,
        detalles_exigencias: exigencias ? (detallesExigencias || null) : null,
        criticidad: criticidad || null,
        responsable_relacion: responsable || null,
        fecha_revision: fechaRevision || null,
        
        created_by: session.user.id,
        user_email: session.user.email || '',
        status
      });

      if (error) throw error;

      toast({
        title: isAdmin ? 'Recomendación guardada' : 'Sugerencia enviada',
        description: isAdmin 
          ? 'La recomendación se ha guardado y publicado directamente.' 
          : 'La acción estratégica ha sido enviada a auditoría para su revisión.',
      });
      
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting action:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar la recomendación.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full mt-4 text-xs h-8 border-dashed flex gap-2">
            <PlusCircle className="h-3 w-3" />
            Sugerir acción
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Recomendaciones y Gestión de Relación</DialogTitle>
            <DialogDescription>
              Proponga una recomendación o acción estratégica.
              {!isAdmin && ' Esta sugerencia pasará por un proceso de aprobación.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!lockedActor && (
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
                      Para todos los actores de este cuadrante ({quadrantTitle})
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
            )}

            {scope === 'actor' && !lockedActor && (
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
                        No hay actores disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="actionText">Acción Estratégica Sugerida *</Label>
              <Textarea
                id="actionText"
                placeholder="Describa la acción estratégica sugerida..."
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                className="min-h-[80px] resize-none text-sm"
                required
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="directrices">Directrices de Trato Específico</Label>
              <Textarea
                id="directrices"
                placeholder="Ej: Solo contactar vía email, prefiere reuniones matutinas..."
                value={directrices}
                onChange={(e) => setDirectrices(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="criticidad">Nivel de Criticidad</Label>
                <Select value={criticidad} onValueChange={setCriticidad}>
                  <SelectTrigger id="criticidad">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaRevision">Próxima Revisión</Label>
                <Input
                  id="fechaRevision"
                  type="date"
                  value={fechaRevision}
                  onChange={(e) => setFechaRevision(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable Interno</Label>
              <Input
                id="responsable"
                placeholder="Nombre del responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exigencias"
                  checked={exigencias}
                  onCheckedChange={(checked) => setExigencias(checked === true)}
                />
                <Label htmlFor="exigencias" className="font-normal cursor-pointer">
                  Exigencias Contractuales / Acuerdos
                </Label>
              </div>
              
              {exigencias && (
                <div className="pl-6 space-y-2">
                  <Label htmlFor="detallesExigencias" className="text-xs">Detalles de las exigencias</Label>
                  <Textarea
                    id="detallesExigencias"
                    placeholder="Especifique los detalles..."
                    value={detallesExigencias}
                    onChange={(e) => setDetallesExigencias(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="btn-animate">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
