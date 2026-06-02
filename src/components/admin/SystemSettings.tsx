import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Database, Users, Activity, ExternalLink } from 'lucide-react';

export function SystemSettings() {
  const securityItems = [
    {
      title: 'Administradores del Sistema',
      description: 'Usuarios con acceso completo al sistema',
      status: 'Configurado',
      variant: 'success' as const,
      details: 'Juliana Toro, Santiago Martínez Castilla'
    },
    {
      title: 'Autenticación',
      description: 'Sistema de autenticación habilitado con Supabase Auth',
      status: 'Activo',
      variant: 'success' as const,
      details: 'Login con email y contraseña, recuperación de contraseña'
    },
    {
      title: 'Row Level Security',
      description: 'Políticas de seguridad en base de datos',
      status: 'Activo',
      variant: 'success' as const,
      details: 'Protección por roles de usuario'
    }
  ];

  const systemStats = [
    { label: 'Versión del Sistema', value: 'v1.0.0' },
    { label: 'Base de Datos', value: 'Supabase PostgreSQL' },
    { label: 'Último Despliegue', value: new Date().toLocaleDateString() },
    { label: 'Tiempo de Actividad', value: '24/7' }
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Sistema Protegido</AlertTitle>
        <AlertDescription>
          El sistema cuenta con autenticación activa mediante Supabase Auth. 
          Los controles de acceso se gestionan mediante roles (admin, editor, viewer) y permisos personalizados por módulo.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Seguridad del Sistema
            </CardTitle>
            <CardDescription>
              Estado de la configuración de seguridad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.details}</p>
                </div>
                <Badge 
                  variant={
                    item.variant === 'success' ? 'default' :
                    item.variant === 'warning' ? 'secondary' : 'destructive'
                  }
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Información del Sistema
            </CardTitle>
            <CardDescription>
              Detalles técnicos y estadísticas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-sm font-medium">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Enlaces de Administración
          </CardTitle>
          <CardDescription>
            Acceso directo a herramientas de administración
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <a 
                href="https://supabase.com/dashboard/project/jhzwbtrgfnmqwcqgucyx/sql/new" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Database className="h-4 w-4 mr-2" />
                Editor SQL
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
            
            <Button variant="outline" className="justify-start" asChild>
              <a 
                href="https://supabase.com/dashboard/project/jhzwbtrgfnmqwcqgucyx/auth/users" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Users className="h-4 w-4 mr-2" />
                Gestión de Usuarios
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}