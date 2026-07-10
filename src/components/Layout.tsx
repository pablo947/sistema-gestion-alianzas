import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ImpersonatorBanner } from '@/components/layout/ImpersonatorBanner';
import { ImpersonatorSelect } from '@/components/layout/ImpersonatorSelect';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
          <ImpersonatorBanner />
          <header className="flex h-14 items-center gap-4 px-6 bg-background border-b z-10 sticky top-0 justify-between shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="shrink-0" />
              <div className="font-semibold text-sm text-muted-foreground hidden sm:block">Gestión de Alianzas</div>
            </div>
            <ImpersonatorSelect />
          </header>
          <main className="flex-1 p-6 custom-scrollbar overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
