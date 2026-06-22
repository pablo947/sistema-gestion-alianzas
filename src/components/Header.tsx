import { SidebarTrigger } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { userProfile, signOut, isAdmin } = useAuth();
  const { toast } = useToast();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    }
  };

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 header-gradient">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-white hover:bg-white/10" />
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/bf9d79fe-6f69-4035-bb1f-6067d269f895.png" alt="Fundación Luker" className="w-8 h-8 mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:rounded-sm dark:p-0.5" />
            <div className="text-white">
              <h1 className="text-lg font-semibold">Fundación Luker</h1>
              <p className="text-xs text-white/80">Sistema de Gestión de Alianzas y Proyectos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* User info and logout */}
          {userProfile && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userProfile.full_name || userProfile.email}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${isAdmin ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80'}`}>
                  {isAdmin ? 'Admin' : 'Viewer'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 text-white/90 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          )}
          
          {/* Theme toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="theme-toggle" className="text-white/80 text-sm">
              <Sun className="w-4 h-4" />
            </Label>
            <Switch
              id="theme-toggle"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-white/20"
            />
            <Label htmlFor="theme-toggle" className="text-white/80 text-sm">
              <Moon className="w-4 h-4" />
            </Label>
          </div>
        </div>
      </div>
    </header>
  );
}