import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-luker-brown dark:text-orange-300",
  iconBgColor = "bg-primary/10 dark:bg-orange-500/20",
  action
}: PageHeaderProps) {
  return (
    <header className="bg-white dark:bg-background border-b border-gray-200 dark:border-border shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-white/90 dark:bg-background/90 px-4 sm:px-6 py-3 sm:py-4 -mx-4 sm:-mx-6 mb-6">
      <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-luker-brown to-luker-orange dark:from-orange-300 dark:to-orange-200 bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {action && <div>{action}</div>}
          <div className="hidden sm:block">
            <img 
              src="/lovable-uploads/bf9d79fe-6f69-4035-bb1f-6067d269f895.png" 
              alt="Fundación Luker" 
              className="h-10 object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:rounded-sm dark:p-1" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
