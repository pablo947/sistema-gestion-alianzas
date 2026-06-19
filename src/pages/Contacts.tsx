
import React, { useState, useMemo } from 'react';
import { fuzzyMatch, fuzzyMatchAll, findDidYouMean } from '@/lib/textUtils';
import { REDES_ALUMNI_OPTIONS, NIVELES_DIRECCION } from '@/components/contacts/types';
import { SECTORES_BASE, ACADEMICO_SUBSECTORES } from '@/components/actors/constants';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Plus, Search, Filter, User, Mail, Phone, Users, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { DidYouMean } from '@/components/DidYouMean';
import { Contact } from '@/components/contacts/types';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useSearchParams } from 'react-router-dom';
import { ModuleStatsPanel } from '@/components/ModuleStatsPanel';
import { PageHeader } from '@/components/layout/PageHeader';

// Ejes Estratégicos oficiales Fundación Luker (sin tilde en "Luker")
const EJES_ESTRATEGICOS_OFICIALES = [
  'Primera infancia',
  'Educación en el aula',
  'Jóvenes y dinámicas más allá del aula',
  'Vida productiva',
  'Organizaciones e Iniciativas del Legado',
  'Conocimiento e Incidencia',
] as const;

const ESTRATEGIAS_MATRIZ = [
  'Gestionar de cerca',
  'Mantener satisfechos',
  'Mantener informados',
  'Monitorear',
] as const;

const getEstrategiaMatriz = (influencia: number | null, interes: number | null): string | null => {
  if (!influencia || !interes) return null;
  if (influencia >= 4 && interes >= 4) return 'Gestionar de cerca';
  if (influencia <= 2 && interes >= 4) return 'Mantener satisfechos';
  if (influencia >= 4 && interes <= 2) return 'Mantener informados';
  if (influencia <= 2 && interes <= 2) return 'Monitorear';
  // valores intermedios
  if (influencia === 3 && interes >= 4) return 'Mantener satisfechos';
  if (influencia >= 4 && interes === 3) return 'Mantener informados';
  return 'Monitorear';
};

export default function Contacts() {
  const { user } = useAuth();
  const { canEditContacts } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filters, setFilters] = useState({
    proyecto: '',
    ejeEstrategico: '',
    redAlumni: '',
    estrategiaMatriz: '',
    responsable: '',
    sector: '',
    nivelDireccion: '',
  });
  const [multiProgramOnly, setMultiProgramOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data: contacts, isLoading } = useQuery<any[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('contacts')
        .select(`
          *,
          actors(
            actor_id,
            nombre_actor,
            sector_actor,
            nivel_influencia,
            nivel_interes,
            actor_programs(
              programs(programa_id, nombre, eje_estrategico)
            )
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data as any[]) || [];
    }
  });

  // Full team member data (incl. area + red_alumni) for filters & display
  const { data: teamMembers = [] } = useQuery<any[]>({
    queryKey: ['team-members-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, nombre, apellidos, cargo, correo, celular, area, red_alumni')
        .order('nombre');
      if (error) throw error;
      return data || [];
    },
  });

  // Unique programs from contacts' actors
  const uniqueProjects = useMemo(() => {
    if (!contacts) return [];
    const set = new Set<string>();
    contacts.forEach((c: any) => {
      c.actors?.actor_programs?.forEach((ap: any) => {
        if (ap.programs?.nombre) set.add(ap.programs.nombre);
      });
    });
    return Array.from(set).sort();
  }, [contacts]);

  const getTeamMemberNames = (memberIds: string[]) => {
    if (!memberIds?.length) return [];
    return memberIds
      .map(id => teamMembers.find((m: any) => m.id === id))
      .filter(Boolean)
      .map((m: any) => `${m.nombre} ${m.apellidos}`);
  };

  // Get eje estratégico(s) of a contact via its actor's linked programs
  const getContactEjes = (contact: any): string[] => {
    const ejes = new Set<string>();
    contact.actors?.actor_programs?.forEach((ap: any) => {
      const eje = ap.programs?.eje_estrategico;
      if (eje) ejes.add(eje);
    });
    return Array.from(ejes);
  };

  const getContactProgramCount = (contact: any): number => {
    return contact.actors?.actor_programs?.length || 0;
  };

  // Build merged list: external contacts + internal team members (for Red Alumni consistency)
  const mergedContacts = useMemo(() => {
    const externals = (contacts || []).map((c: any) => ({ ...c, _source: 'external' as const }));
    const internals = (teamMembers || []).map((tm: any) => ({
      contact_id: `team-${tm.id}`,
      nombre: tm.nombre,
      apellidos: tm.apellidos,
      cargo: tm.cargo,
      correo: tm.correo,
      telefono: tm.celular,
      ciudad: '',
      tipo_contacto: tm.red_alumni || [],
      responsable_seguimiento: [],
      notas: '',
      actor_id: null,
      actors: { nombre_actor: 'Fundacion Luker', actor_programs: [] },
      updated_at: null,
      _source: 'internal' as const,
      _area: tm.area,
    }));
    return [...externals, ...internals];
  }, [contacts, teamMembers]);

  React.useEffect(() => {
    const contactIdParam = searchParams.get('contactId');
    if (!contactIdParam || !contacts) return;
    const target = contacts.find((c: any) => c.contact_id === contactIdParam);
    if (target) {
      setSelectedContact(target as Contact);
      setShowDialog(true);
      const next = new URLSearchParams(searchParams);
      next.delete('contactId');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, contacts]);

  const filteredContacts = mergedContacts.filter((contact: any) => {
    const matchesSearch = fuzzyMatchAll(
      [
        contact.nombre,
        contact.apellidos,
        contact.actors?.nombre_actor,
        contact.correo,
        contact.cargo,
        contact.ciudad,
      ],
      searchTerm
    );

    const matchesProject = !filters.proyecto ||
      contact.actors?.actor_programs?.some((ap: any) =>
        ap.programs?.nombre === filters.proyecto
      );

    const matchesEje = !filters.ejeEstrategico ||
      contact.actors?.actor_programs?.some((ap: any) =>
        ap.programs?.eje_estrategico === filters.ejeEstrategico
      );

    const matchesRedAlumni = !filters.redAlumni ||
      (Array.isArray(contact.tipo_contacto) && contact.tipo_contacto.includes(filters.redAlumni));

    const matchesEstrategia = !filters.estrategiaMatriz || (() => {
      if (contact._source === 'internal') return false;
      const est = getEstrategiaMatriz(
        contact.actors?.nivel_influencia,
        contact.actors?.nivel_interes
      );
      return est === filters.estrategiaMatriz;
    })();

    const matchesResponsable = !filters.responsable ||
      (Array.isArray(contact.responsable_seguimiento) &&
        contact.responsable_seguimiento.includes(filters.responsable));

    const matchesSector = !filters.sector ||
      contact.actors?.sector_actor === filters.sector;

    const matchesNivelDireccion = !filters.nivelDireccion ||
      contact.nivel_direccion === filters.nivelDireccion;

    const matchesMultiProgram = !multiProgramOnly || getContactProgramCount(contact) > 1;

    return matchesSearch && matchesProject && matchesEje && matchesRedAlumni &&
      matchesEstrategia && matchesResponsable && matchesSector && matchesNivelDireccion && matchesMultiProgram;
  });

  const hasActiveFilters = searchTerm || filters.proyecto || filters.ejeEstrategico ||
    filters.redAlumni || filters.estrategiaMatriz || filters.responsable || filters.sector || filters.nivelDireccion || multiProgramOnly;

  const didYouMeanSuggestion = useMemo(() => {
    if (!searchTerm.trim() || !mergedContacts.length || filteredContacts.length > 0) return null;
    const names = mergedContacts.map((c: any) => `${c.nombre} ${c.apellidos || ''}`.trim());
    return findDidYouMean(searchTerm, names);
  }, [searchTerm, mergedContacts, filteredContacts]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({ proyecto: '', ejeEstrategico: '', redAlumni: '', estrategiaMatriz: '', responsable: '', sector: '', nivelDireccion: '' });
    setMultiProgramOnly(false);
  };

  const handleNewContact = () => {
    setSelectedContact(null);
    setShowDialog(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDialog(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
    setShowDialog(false);
    toast({
      title: "¡Contacto guardado!",
      description: "¡A celebrar con un café! ☕",
    });
  };

  const lastUpdatedContact = useMemo(() => {
    if (!contacts || contacts.length === 0) return null;
    return [...contacts].sort((a: any, b: any) =>
      new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
    )[0];
  }, [contacts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <PageHeader 
        title="Contactos"
        description="Gestiona los contactos del ecosistema de la Fundación Luker"
        icon={User}
        action={
          canEditContacts() && (
            <Button onClick={handleNewContact} className="btn-animate">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contacto
              <kbd className="ml-2 kbd-shortcut">N</kbd>
            </Button>
          )
        }
      />

      <ModuleStatsPanel
        totalCount={filteredContacts.length}
        label="contactos encontrados"
        lastUpdatedAt={lastUpdatedContact?.updated_at}
        lastUpdatedBy={user?.email ?? null}
      />

      {/* Search and filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {hasActiveFilters && (
            <Button onClick={clearAllFilters} variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        {didYouMeanSuggestion && (
          <DidYouMean suggestion={didYouMeanSuggestion} onAccept={(term) => setSearchTerm(term)} />
        )}

        {/* Advanced Filters */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {/* Programa/Iniciativa */}
          <Select value={filters.proyecto} onValueChange={(value) => setFilters(prev => ({ ...prev, proyecto: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Programa/Iniciativa" />
            </SelectTrigger>
            <SelectContent>
              {uniqueProjects.map((proyecto) => (
                <SelectItem key={proyecto} value={proyecto}>{proyecto}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Eje Estratégico */}
          <Select value={filters.ejeEstrategico} onValueChange={(value) => setFilters(prev => ({ ...prev, ejeEstrategico: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Eje Estratégico" />
            </SelectTrigger>
            <SelectContent>
              {EJES_ESTRATEGICOS_OFICIALES.map((eje) => (
                <SelectItem key={eje} value={eje}>{eje}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Red Alumni */}
          <Select value={filters.redAlumni} onValueChange={(value) => setFilters(prev => ({ ...prev, redAlumni: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Red Alumni" />
            </SelectTrigger>
            <SelectContent>
              {REDES_ALUMNI_OPTIONS.map((red) => (
                <SelectItem key={red} value={red}>{red}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Estrategia Matriz */}
          <Select value={filters.estrategiaMatriz} onValueChange={(value) => setFilters(prev => ({ ...prev, estrategiaMatriz: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Estrategia (Matriz)" />
            </SelectTrigger>
            <SelectContent>
              {ESTRATEGIAS_MATRIZ.map((est) => (
                <SelectItem key={est} value={est}>{est}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Responsable Interno */}
          <Select value={filters.responsable} onValueChange={(value) => setFilters(prev => ({ ...prev, responsable: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Responsable Interno" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((tm: any) => (
                <SelectItem key={tm.id} value={tm.id}>
                  {tm.nombre} {tm.apellidos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sector */}
          <Select value={filters.sector} onValueChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SECTORES_BASE.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                {ACADEMICO_SUBSECTORES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace('Académico — ', '')}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Nivel de Dirección */}
          <Select value={filters.nivelDireccion} onValueChange={(value) => setFilters(prev => ({ ...prev, nivelDireccion: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Nivel de Dirección" />
            </SelectTrigger>
            <SelectContent>
              {NIVELES_DIRECCION.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Multi-programa switch */}
          <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2">
            <Label htmlFor="multi-program" className="text-sm font-normal cursor-pointer">
              Mostrar solo contactos en más de un programa
            </Label>
            <Switch
              id="multi-program"
              checked={multiProgramOnly}
              onCheckedChange={setMultiProgramOnly}
            />
          </div>
        </div>

        {/* Results counter */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredContacts.length} contacto{filteredContacts.length !== 1 ? 's' : ''} encontrado{filteredContacts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Contacts grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContacts.map((contact: any) => {
          const responsableNames = getTeamMemberNames(contact.responsable_seguimiento || []);
          const ejes = getContactEjes(contact);
          const isInternal = contact._source === 'internal';

          return (
            <Card
              key={contact.contact_id}
              className="btn-animate cursor-pointer hover:shadow-md"
              onClick={() => !isInternal && handleEditContact(contact)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {contact.nombre} {contact.apellidos}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {isInternal ? 'Fundacion Luker' : (contact.actors?.nombre_actor || 'Sin actor asignado')}
                    </p>
                    {!isInternal && contact.actors?.sector_actor && (
                      <p className="text-xs text-muted-foreground/80 mt-0.5">
                        {contact.actors.sector_actor}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  {Array.isArray(contact.tipo_contacto) && contact.tipo_contacto.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {contact.tipo_contacto.map((red: string) => (
                        <Badge key={red} variant="secondary" className="text-xs">
                          {red}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {(contact.cargo || ejes.length > 0) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {contact.cargo && (
                        <Badge variant="outline" className="text-xs">
                          {contact.cargo}
                        </Badge>
                      )}
                      {ejes.map((eje) => (
                        <Badge key={eje} variant="default" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                          {eje}
                        </Badge>
                      ))}
                      {isInternal && contact._area && (
                        <Badge variant="outline" className="text-xs">
                          {contact._area}
                        </Badge>
                      )}
                    </div>
                  )}

                  {contact.correo && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{contact.correo}</span>
                    </div>
                  )}

                  {contact.telefono && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{contact.telefono}</span>
                    </div>
                  )}

                  {contact.ciudad && (
                    <div className="text-muted-foreground">
                      <span className="font-medium">Ciudad:</span> {contact.ciudad}
                    </div>
                  )}

                  {/* Responsable de Seguimiento */}
                  {contact.responsable_seguimiento && Array.isArray(contact.responsable_seguimiento) && contact.responsable_seguimiento.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm flex-1">
                        <span className="font-medium">Responsable:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {responsableNames.slice(0, 2).map((responsableName, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {responsableName}
                            </Badge>
                          ))}
                          {responsableNames.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{responsableNames.length - 2} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">No hay contactos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasActiveFilters ? 'No se encontraron contactos con esos criterios.' : 'Comienza agregando tu primer contacto.'}
          </p>
          {!hasActiveFilters && canEditContacts() && (
            <div className="mt-6">
              <Button onClick={handleNewContact} className="btn-animate">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Contacto
              </Button>
            </div>
          )}
        </div>
      )}

      <ContactDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        contact={selectedContact}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
