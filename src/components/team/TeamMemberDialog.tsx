import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/hooks/usePermissions";

const AREA_OPTIONS = [
  "Gerencia",
  "Administrativo y Jurídico",
  "Programas",
  "Conocimiento e Incidencia",
] as const;

const RED_ALUMNI_TEAM_OPTIONS = [
  "Nido: Laboratorio de Liderazgo",
  "Team Impacto Colectivo",
] as const;

interface TeamMember {
  id: string;
  nombre: string;
  apellidos: string;
  area: string;
  cargo: string;
  correo?: string;
  celular?: string;
  red_alumni?: string[];
}

interface TeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  member?: TeamMember | null;
}

export const TeamMemberDialog = ({ open, onClose, member }: TeamMemberDialogProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    area: "",
    cargo: "",
    correo: "",
    celular: "",
    red_alumni: [] as string[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canEditTeam } = usePermissions();

  useEffect(() => {
    if (member) {
      setFormData({
        nombre: member.nombre,
        apellidos: member.apellidos,
        area: member.area,
        cargo: member.cargo,
        correo: member.correo || "",
        celular: member.celular || "",
        red_alumni: Array.isArray(member.red_alumni) ? member.red_alumni : (typeof member.red_alumni === 'string' ? [member.red_alumni] : []),
      });
    } else {
      setFormData({
        nombre: "",
        apellidos: "",
        area: "",
        cargo: "",
        correo: "",
        celular: "",
        red_alumni: [],
      });
    }
  }, [member]);

  const createMemberMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("team_members")
        .insert([{
          nombre: data.nombre,
          apellidos: data.apellidos,
          area: data.area,
          cargo: data.cargo,
          correo: data.correo || null,
          celular: data.celular || null,
          red_alumni: data.red_alumni,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({
        title: "Funcionario agregado",
        description: "El miembro del equipo ha sido agregado exitosamente.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo agregar el miembro del equipo.",
        variant: "destructive",
      });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!member?.id) throw new Error("No member ID");
      
      const { error } = await supabase
        .from("team_members")
        .update({
          nombre: data.nombre,
          apellidos: data.apellidos,
          area: data.area,
          cargo: data.cargo,
          correo: data.correo || null,
          celular: data.celular || null,
          red_alumni: data.red_alumni,
        })
        .eq("id", member.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({
        title: "Funcionario actualizado",
        description: "El miembro del equipo ha sido actualizado exitosamente.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el miembro del equipo.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellidos || !formData.area || !formData.cargo) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (member) {
      updateMemberMutation.mutate(formData);
    } else {
      createMemberMutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {member ? "Editar Funcionario" : "Agregar Funcionario/a"}
          </DialogTitle>
          <DialogDescription>
            {member 
              ? "Modifica la información del miembro del equipo."
              : "Completa la información del nuevo miembro del equipo."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Nombre"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos *</Label>
              <Input
                id="apellidos"
                value={formData.apellidos}
                onChange={(e) => handleChange("apellidos", e.target.value)}
                placeholder="Apellidos"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Equipo *</Label>
            <Select value={formData.area} onValueChange={(value) => handleChange("area", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un área" />
              </SelectTrigger>
              <SelectContent>
                {AREA_OPTIONS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo *</Label>
            <Input
              id="cargo"
              value={formData.cargo}
              onChange={(e) => handleChange("cargo", e.target.value)}
              placeholder="Cargo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo</Label>
            <Input
              id="correo"
              type="email"
              value={formData.correo}
              onChange={(e) => handleChange("correo", e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="celular">Celular</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => handleChange("celular", e.target.value)}
              placeholder="Número de celular"
            />
          </div>

          <div className="space-y-2">
            <Label>Red Alumni</Label>
            <div className="space-y-2">
              {RED_ALUMNI_TEAM_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`red-alumni-${option}`}
                    checked={formData.red_alumni.includes(option)}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        red_alumni: checked
                          ? [...prev.red_alumni, option]
                          : prev.red_alumni.filter(r => r !== option),
                      }));
                    }}
                  />
                  <label htmlFor={`red-alumni-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {canEditTeam() ? 'Cancelar' : 'Cerrar'}
            </Button>
            {canEditTeam() && (
              <Button 
                type="submit" 
                disabled={createMemberMutation.isPending || updateMemberMutation.isPending}
              >
                {member ? "Actualizar" : "Agregar"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};