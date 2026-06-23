import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ShieldAlert } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export function PermissionsPanel() {
  return (
    <Card className="border-muted/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Matriz de Permisos por Rol (RBAC)
        </CardTitle>
        <CardDescription>
          Los permisos se asignan por rol. Reglas clave:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Gestor Estratégico</strong>: Crea actores en estado Pendiente. Edita actores como "Solicitudes de Cambio". Gestiona las Recomendaciones directamente.</li>
            <li><strong>Auditor</strong>: Visualiza la bandeja de "Solicitudes Pendientes" y tiene el poder exclusivo para Aprobar/Rechazar solicitudes de Actores.</li>
          </ul>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="bg-muted/30 px-4 py-3 border-b flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Para modificar los accesos de un usuario, cambia su rol desde la pestaña "Usuarios".
            </span>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Módulo / Acción</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Gestor Estratégico</TableHead>
                <TableHead>Gestor Operativo</TableHead>
                <TableHead>Auditor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Actores</TableCell>
                <TableCell><Badge variant="default">Control Total</Badge></TableCell>
                <TableCell><Badge variant="outline">Crear/Editar (Pendientes)</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
                <TableCell><Badge variant="default">Aprobar/Rechazar</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Contactos</TableCell>
                <TableCell><Badge variant="default">Control Total</Badge></TableCell>
                <TableCell><Badge variant="default">Crear/Editar</Badge></TableCell>
                <TableCell><Badge variant="default">Crear/Editar</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Clasificación de aliados</TableCell>
                <TableCell><Badge variant="default">Control Total</Badge></TableCell>
                <TableCell><Badge variant="outline">Recomendaciones</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Programas e iniciativas</TableCell>
                <TableCell><Badge variant="default">Control Total</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Equipo Fundación Luker</TableCell>
                <TableCell><Badge variant="default">Control Total</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
                <TableCell><Badge variant="secondary">Solo Lectura</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Descarga de reportes</TableCell>
                <TableCell><Badge variant="default">Control Total</Badge></TableCell>
                <TableCell><Badge variant="secondary">Acceso</Badge></TableCell>
                <TableCell><Badge variant="secondary">Acceso</Badge></TableCell>
                <TableCell><Badge variant="secondary">Acceso</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Administración</TableCell>
                <TableCell><Badge variant="destructive">Control Total</Badge></TableCell>
                <TableCell><Badge variant="outline" className="text-destructive">Bloqueado</Badge></TableCell>
                <TableCell><Badge variant="outline" className="text-destructive">Bloqueado</Badge></TableCell>
                <TableCell><Badge variant="outline" className="text-destructive">Bloqueado</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
