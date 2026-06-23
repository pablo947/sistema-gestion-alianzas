import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { TeamMemberDialog } from "@/components/team/TeamMemberDialog";
import { TeamOrgChart } from "@/components/team/TeamOrgChart";
import { PageHeader } from "@/components/layout/PageHeader";

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

const Team = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const { toast } = useToast();
  const { canEditTeam, canDeleteTeam } = usePermissions();
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("area", { ascending: true })
        .order("nombre", { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({
        title: "Funcionario eliminado",
        description: "El miembro del equipo ha sido eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el miembro del equipo.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMemberMutation.mutate(id);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingMember(null);
  };

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      "Gerencia": "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200",
      "Administrativo y Jurídico": "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
      "Programas": "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200",
      "Conocimiento e Incidencia": "bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-200",
    };
    return colors[area] || "bg-muted text-muted-foreground";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando equipo...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Equipo Fundación Luker"
        action={
          canEditTeam() && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Funcionario/a
            </Button>
          )
        }
      />

      {teamMembers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organigrama
          </h2>
          <TeamOrgChart teamMembers={teamMembers} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {member.nombre} {member.apellidos}
              </CardTitle>
              <Badge className={`w-fit ${getAreaColor(member.area)}`}>
                {member.area}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium text-sm">Cargo:</span>
                <p className="text-sm text-muted-foreground">{member.cargo}</p>
              </div>
              {member.correo && (
                <div>
                  <span className="font-medium text-sm">Correo:</span>
                  <p className="text-sm text-muted-foreground">{member.correo}</p>
                </div>
              )}
              {member.celular && (
                <div>
                  <span className="font-medium text-sm">Celular:</span>
                  <p className="text-sm text-muted-foreground">{member.celular}</p>
                </div>
              )}
              {member.red_alumni && member.red_alumni.length > 0 && (
                <div>
                  <span className="font-medium text-sm">Red Alumni:</span>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(member.red_alumni) ? member.red_alumni.join(', ') : member.red_alumni}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {canEditTeam() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                  >
                    Editar
                  </Button>
                )}
                {canDeleteTeam() && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay miembros del equipo</h3>
            <p className="text-muted-foreground mb-4">
              Comienza agregando el primer funcionario del equipo.
            </p>
            {canEditTeam() && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Funcionario/a
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <TeamMemberDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        member={editingMember}
      />
    </div>
  );
};

export default Team;