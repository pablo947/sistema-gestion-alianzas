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

interface TeamOrgChartProps {
  teamMembers: TeamMember[];
}

const AREA_DISPLAY: Record<string, string> = {
  "Administrativo y Jurídico": "Equipo Administrativo y Jurídico",
  "Programas": "Equipo de Programas",
  "Conocimiento e Incidencia": "Equipo de Conocimiento e Incidencia",
};

const normalizeArea = (area: string) => AREA_DISPLAY[area] || area;

export const TeamOrgChart = ({ teamMembers }: TeamOrgChartProps) => {
  const groupedByArea = teamMembers.reduce((acc, member) => {
    const displayArea = normalizeArea(member.area);
    if (!acc[displayArea]) {
      acc[displayArea] = [];
    }
    acc[displayArea].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const areaOrder = [
    "Gerencia",
    "Equipo Administrativo y Jurídico",
    "Equipo de Programas",
    "Equipo de Conocimiento e Incidencia",
  ];

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      "Gerencia":
        "border-purple-300 bg-purple-50 dark:border-purple-400/30 dark:bg-purple-950/20",
      "Equipo Administrativo y Jurídico":
        "border-blue-300 bg-blue-50 dark:border-blue-400/30 dark:bg-blue-950/20",
      "Equipo de Programas":
        "border-green-300 bg-green-50 dark:border-green-400/30 dark:bg-green-950/20",
      "Equipo de Conocimiento e Incidencia":
        "border-pink-300 bg-pink-50 dark:border-pink-400/30 dark:bg-pink-950/20",
    };
    return colors[area] || "border-border bg-muted/30";
  };

  return (
    <div className="space-y-6">
      {areaOrder.map((area) => {
        const members = groupedByArea[area];
        if (!members || members.length === 0) return null;

        return (
          <div
            key={area}
            className={`border-2 rounded-lg p-4 transition-colors duration-300 ${getAreaColor(area)}`}
          >
            <h3 className="font-semibold text-base md:text-lg mb-3 text-center leading-snug text-foreground dark:text-white dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-colors duration-300">
              {area}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-card border border-border rounded-lg p-3 shadow-sm dark:bg-[hsl(0_0%_12%)] dark:border-white/10 transition-colors duration-300"
                >
                  <div className="text-center">
                    <div className="font-medium text-sm text-card-foreground dark:text-white transition-colors duration-300">
                      {member.nombre} {member.apellidos}
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-[hsl(0_0%_88%)] mt-1 transition-colors duration-300">
                      {member.cargo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
