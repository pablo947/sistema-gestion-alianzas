
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onDownload: () => void;
  isLoading?: boolean;
  dataCount?: number;
  buttonText?: string;
  disabled?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  description,
  icon,
  onDownload,
  isLoading = false,
  dataCount,
  buttonText = "Descargar Reporte",
  disabled = false
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            {dataCount !== undefined && (
              <p className="text-sm text-muted-foreground mt-1">
                {dataCount} registro{dataCount !== 1 ? 's' : ''} {dataCount === 1 ? 'seleccionado' : 'disponibles'}
              </p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          {description}
        </p>
        <Button 
          onClick={onDownload} 
          disabled={isLoading || disabled}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando reporte...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
