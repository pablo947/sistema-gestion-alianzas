import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Home,
  Building2,
  Contact,
  Users,
  FolderKanban,
  Search,
  FileDown,
  Shield,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  Award,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Actores", url: "/actors", icon: Building2 },
  { title: "Contactos", url: "/contacts", icon: Contact },
  { title: "Clasificación de Aliados", url: "/strategies", icon: Award },
  { title: "Análisis de Redes y Relaciones", url: "/grafos", icon: Search },
  { title: "Programas e Iniciativas", url: "/projects", icon: FolderKanban },
  { title: "Equipo Fundación Luker", url: "/team", icon: Users },
  { title: "Descarga de Reportes", url: "/reports", icon: FileDown },
  { title: "Administración", url: "/admin", icon: Shield, adminOnly: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, userProfile, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión exitosamente" });
    }
  };

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="flex flex-col h-full">
        {/* Logo area */}
        {!collapsed && (
          <div className="px-4 py-5 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/bf9d79fe-6f69-4035-bb1f-6067d269f895.png" alt="Fundación Luker" className="w-8 h-8" />
              <div>
                <p className="text-sm font-semibold text-sidebar-foreground">Fundación Luker</p>
                <p className="text-[10px] text-muted-foreground">Gestión de Alianzas</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(item => !item.adminOnly || isAdmin)
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive(item.url)
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom: User info + theme */}
        {!collapsed && user && (
          <div className="mt-auto border-t border-sidebar-border px-4 py-4 space-y-3">
            {/* Theme toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sun className="w-3.5 h-3.5" />
                <span>Tema</span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="scale-75"
              />
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{userProfile?.full_name || user.email}</p>
                <p className="text-[10px] text-muted-foreground">{isAdmin ? 'Administrador' : 'Usuario'}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground text-xs h-8"
              onClick={handleSignOut}
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
