import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Search, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function InternalMatrixTable() {
  const { userProfile, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [quadrantFilter, setQuadrantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: actions, isLoading } = useQuery({
    queryKey: ['internal-matrix', userProfile?.id, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('strategic_actions')
        .select(`
          *,
          actor:actors(nombre_actor)
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && userProfile?.id) {
        query = query.or(`status.eq.approved,created_by.eq.${userProfile.id}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const filteredActions = actions?.filter(action => {
    const matchesSearch = 
      action.action_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (action.actor?.nombre_actor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      action.user_email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesQuadrant = quadrantFilter === 'all' || action.quadrant_key === quadrantFilter;
    const matchesStatus = statusFilter === 'all' || action.status === statusFilter;

    return matchesSearch && matchesQuadrant && matchesStatus;
  }) || [];

  const getQuadrantName = (key: string) => {
    const map: Record<string, string> = {
      'close': 'Gestionar de cerca',
      'satisfied': 'Mantener satisfechos',
      'informed': 'Mantener informados',
      'monitor': 'Monitorear'
    };
    return map[key] || key;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <span className="px-2 py-1 text-xs rounded-full bg-luker-green/10 text-luker-green font-medium">Aprobada</span>;
    if (status === 'pending_approval') return <span className="px-2 py-1 text-xs rounded-full bg-luker-orange/10 text-luker-orange font-medium">Pendiente</span>;
    if (status === 'rejected') return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">Rechazada</span>;
    return <span>{status}</span>;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando matriz interna...</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por texto, actor o autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={quadrantFilter} onValueChange={setQuadrantFilter}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Todos los cuadrantes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los cuadrantes</SelectItem>
              <SelectItem value="close">Gestionar de cerca</SelectItem>
              <SelectItem value="satisfied">Mantener satisfechos</SelectItem>
              <SelectItem value="informed">Mantener informados</SelectItem>
              <SelectItem value="monitor">Monitorear</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="approved">Aprobadas</SelectItem>
              <SelectItem value="pending_approval">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cuadrante</TableHead>
                <TableHead>Alcance</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead className="w-[30%]">Acción Estratégica</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Autor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Info className="w-8 h-8 mb-2 opacity-20" />
                      No se encontraron acciones que coincidan con los filtros.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(action.created_at), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {getQuadrantName(action.quadrant_key)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {action.scope === 'quadrant' ? 'General' : 'Específico'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {action.actor?.nombre_actor || '-'}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate" title={action.action_text}>
                      {action.action_text}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(action.status)}
                    </TableCell>
                    <TableCell className="text-sm truncate max-w-[150px]" title={action.user_email}>
                      {action.user_email}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
