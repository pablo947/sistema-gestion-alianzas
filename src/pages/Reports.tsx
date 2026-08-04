
import React, { useState, useMemo } from 'react';
import { FolderKanban, Users, Contact } from 'lucide-react';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportConfiguration } from '@/components/reports/ReportConfiguration';
import { AdvancedFilters } from '@/components/reports/AdvancedFilters';
import { ContactsAdvancedFilters } from '@/components/reports/ContactsAdvancedFilters';
import { ProgramsAdvancedFilters, ProgramsFiltersState } from '@/components/reports/ProgramsAdvancedFilters';
import { ModuleStatsPanel } from '@/components/ModuleStatsPanel';
import { useProgramsReport } from '@/hooks/useProgramsReport';
import { useFilteredProgramsReport } from '@/hooks/useFilteredProgramsReport';
import { useProgramsAdvancedExport } from '@/hooks/useProgramsAdvancedExport';
import { useActorsReport } from '@/hooks/useActorsReport';
import { useContactsReport } from '@/hooks/useContactsReport';
import { useIndividualProgramReport } from '@/hooks/useIndividualProgramReport';
import { useIndividualActorReport } from '@/hooks/useIndividualActorReport';
import { useProgramsList } from '@/hooks/useProgramsList';
import { useActorsList } from '@/hooks/useActorsList';
import { useFilteredReports } from '@/hooks/useFilteredReports';
import { useFilteredContactsReport, ContactsFilterState } from '@/hooks/useFilteredContactsReport';
import { useActiveMunicipios } from '@/hooks/useActiveMunicipios';
import { useExcelExport } from '@/hooks/useExcelExport';
import { useDocumentExport } from '@/hooks/useDocumentExport';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from '@/components/layout/PageHeader';

export default function Reports() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reportType, setReportType] = useState<'global' | 'individual'>('global');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedActor, setSelectedActor] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'excel' | 'word'>('excel');
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingActors, setLoadingActors] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  
  // Advanced filters state (actors)
  const [advancedFilters, setAdvancedFilters] = useState<{
    municipio: string[];
    tipoRelacion: string[];
    programa: string[];
    actor: string[];
    eje: string[];
    sector: string[];
    sinContactos: boolean;
    estrategia: string[];
  }>({
    municipio: [],
    tipoRelacion: [],
    programa: [],
    actor: [],
    eje: [],
    sector: [],
    sinContactos: false,
    estrategia: []
  });

  // Advanced filters state (contacts)
  const [contactsFilters, setContactsFilters] = useState<ContactsFilterState>({
    redAlumni: [],
    equipo: [],
    actor: [],
    sector: [],
    nivelDireccion: [],
  });

  // Advanced filters state (programs)
  const [programsFilters, setProgramsFilters] = useState<ProgramsFiltersState>({
    ejeEstrategico: [],
    programa: [],
    actor: [],
    anio: [],
  });
  
  // Global data hooks
  const { data: globalProgramsData = [], isLoading: isLoadingGlobalPrograms } = useProgramsReport();
  const { data: globalActorsData = [], isLoading: isLoadingGlobalActors } = useActorsReport();
  const { data: globalContactsData = [], isLoading: isLoadingGlobalContacts } = useContactsReport();
  
  // Individual data hooks
  const { data: individualProgramData, isLoading: isLoadingIndividualProgram } = useIndividualProgramReport(selectedProgram);
  const { data: individualActorData, isLoading: isLoadingIndividualActor } = useIndividualActorReport(selectedActor);
  
  // Lists for dropdowns
  const { data: programsList = [] } = useProgramsList();
  const { data: actorsList = [] } = useActorsList();
  const { data: activeMunicipios = [] } = useActiveMunicipios();
  
  // Filtered reports hooks
  const { data: filteredData = [], isLoading: isLoadingFiltered, error: filteredError } = useFilteredReports({
    municipio: advancedFilters.municipio,
    tipoRelacion: advancedFilters.tipoRelacion,
    programa: advancedFilters.programa,
    actor: advancedFilters.actor,
    eje: advancedFilters.eje,
    sector: advancedFilters.sector,
    sinContactos: advancedFilters.sinContactos,
    estrategia: advancedFilters.estrategia
  });

  const { data: filteredContactsData = [], isLoading: isLoadingFilteredContacts, error: filteredContactsError } = useFilteredContactsReport(contactsFilters);

  const { data: filteredProgramsData = [], isLoading: isLoadingFilteredPrograms, error: filteredProgramsError } = useFilteredProgramsReport(programsFilters);

  // Export hooks
  const { exportProgramsReport, exportActorsReport, exportFilteredReport, exportIndividualProgramReport, exportContactsReport, exportFilteredContactsReport } = useExcelExport();
  const { exportProgramAsDocx, exportActorAsDocx } = useDocumentExport();
  const { exportIndicators, exportBudget, exportActorsByProgram, exportSynergy } = useProgramsAdvancedExport();

  // Available ejes estratégicos from program data (orden oficial Luker)
  const EJES_ORDEN_OFICIAL = [
    'Primera infancia',
    'Educación en el aula',
    'Jóvenes y dinámicas más allá del aula',
    'Vida productiva',
    'Organizaciones e Iniciativas del Legado',
    'Conocimiento e Incidencia',
  ];
  const ejesEstrategicos = useMemo(() => {
    const set = new Set<string>();
    globalProgramsData.forEach((p: any) => { if (p.eje_estrategico) set.add(p.eje_estrategico); });
    const present = Array.from(set);
    const ordered = EJES_ORDEN_OFICIAL.filter(e => present.includes(e));
    const extras = present.filter(e => !EJES_ORDEN_OFICIAL.includes(e)).sort();
    return [...ordered, ...extras];
  }, [globalProgramsData]);

  const programsTraceability = useMemo(() => {
    if (!globalProgramsData.length) return { lastUpdatedAt: null, lastUpdatedBy: null };
    const sorted = [...globalProgramsData].sort((a: any, b: any) =>
      new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
    );
    return { lastUpdatedAt: (sorted[0] as any)?.updated_at || (sorted[0] as any)?.created_at || null, lastUpdatedBy: user?.email || null };
  }, [globalProgramsData, user]);

  const handleProgramsFilterChange = (type: keyof ProgramsFiltersState, value: string | number) => {
    setProgramsFilters(prev => ({ ...prev, [type]: [...(prev[type] as any[]), value] }));
  };
  const handleProgramsFilterRemove = (type: keyof ProgramsFiltersState, value: string | number) => {
    setProgramsFilters(prev => ({ ...prev, [type]: (prev[type] as any[]).filter(v => v !== value) }));
  };

  // Traceability: contacts (updated_at is present in the raw mapped data)
  const contactsTraceability = useMemo(() => {
    if (!globalContactsData.length) return { lastUpdatedAt: null, lastUpdatedBy: null };
    const sorted = [...globalContactsData].sort((a: any, b: any) =>
      new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
    );
    return { lastUpdatedAt: (sorted[0] as any)?.updated_at || null, lastUpdatedBy: user?.email || null };
  }, [globalContactsData, user]);

  // --- Download handlers ---
  const handleDownloadContactsReport = async () => {
    setLoadingContacts(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      exportContactsReport(globalContactsData);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Hubo un error al generar el reporte de contactos", variant: "destructive" });
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleDownloadContactsAlumniReport = async () => {
    // removed
  };

  const handleDownloadProgramsReport = async () => {
    setLoadingPrograms(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (reportType === 'global') {
        exportProgramsReport(globalProgramsData);
      } else if (selectedProgram && individualProgramData) {
        if (exportFormat === 'excel') {
          exportIndividualProgramReport(individualProgramData);
        } else if (exportFormat === 'word') {
          await exportProgramAsDocx(individualProgramData);
        }
      } else {
        toast({ title: "Error", description: "No se pudieron cargar los datos del programa seleccionado", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Hubo un error al generar el reporte de programas", variant: "destructive" });
    } finally {
      setLoadingPrograms(false);
    }
  };

  const handleDownloadActorsReport = async () => {
    setLoadingActors(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (reportType === 'global') {
        exportActorsReport(globalActorsData);
      } else if (selectedActor && individualActorData) {
        if (exportFormat === 'excel') {
          exportActorsReport([individualActorData]);
        } else if (exportFormat === 'word') {
          await exportActorAsDocx(individualActorData);
        }
      } else {
        toast({ title: "Error", description: "No se pudieron cargar los datos del actor seleccionado", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Hubo un error al generar el reporte de actores", variant: "destructive" });
    } finally {
      setLoadingActors(false);
    }
  };

  const handleDownloadFilteredReport = async () => {
    if (!filteredData || filteredData.length === 0) {
      toast({ title: "Sin datos para exportar", description: "No se encontraron datos con los filtros seleccionados.", variant: "destructive" });
      return;
    }
    try {
      exportFilteredReport(filteredData, advancedFilters);
      toast({ title: "Éxito", description: `Reporte filtrado generado con ${filteredData.length} registros` });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Error al generar el reporte filtrado", variant: "destructive" });
    }
  };

  const handleDownloadFilteredContactsReport = async () => {
    if (!filteredContactsData || filteredContactsData.length === 0) {
      toast({ title: "Sin datos para exportar", description: "No se encontraron contactos con los filtros seleccionados.", variant: "destructive" });
      return;
    }
    try {
      exportFilteredContactsReport(filteredContactsData, contactsFilters);
      toast({ title: "Éxito", description: `Reporte filtrado de contactos con ${filteredContactsData.length} registros` });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Error al generar el reporte filtrado de contactos", variant: "destructive" });
    }
  };

  // --- Button helpers ---
  const getProgramsButtonText = () => {
    if (reportType === 'global') return 'Descargar Reporte Global';
    if (!selectedProgram) return 'Seleccionar Programa';
    return `Descargar Reporte (${exportFormat.toUpperCase()})`;
  };
  const getActorsButtonText = () => {
    if (reportType === 'global') return 'Descargar Reporte Global';
    if (!selectedActor) return 'Seleccionar Actor';
    return `Descargar Reporte (${exportFormat.toUpperCase()})`;
  };
  const isProgramsDisabled = () => reportType !== 'global' && !selectedProgram;
  const isActorsDisabled = () => reportType !== 'global' && !selectedActor;
  const getProgramsDataCount = () => reportType === 'global' ? globalProgramsData.length : (selectedProgram ? 1 : 0);
  const getActorsDataCount = () => reportType === 'global' ? globalActorsData.length : (selectedActor ? 1 : 0);

  // Filter management (actors)
  const handleFilterChange = (type: string, value: string | boolean) => {
    if (type === 'sinContactos') {
      setAdvancedFilters(prev => ({ ...prev, sinContactos: value as boolean }));
    } else {
      setAdvancedFilters(prev => ({
        ...prev,
        [type]: [...(prev[type as keyof typeof prev] as string[]), value as string]
      }));
    }
  };
  const handleFilterRemove = (type: string, value: string) => {
    setAdvancedFilters(prev => {
      const filterValue = prev[type as keyof typeof prev];
      if (Array.isArray(filterValue)) {
        return { ...prev, [type]: filterValue.filter((item: string) => item !== value) };
      }
      return prev;
    });
  };

  // Filter management (contacts)
  const handleContactsFilterChange = (type: string, value: string) => {
    setContactsFilters(prev => ({
      ...prev,
      [type]: [...(prev[type as keyof typeof prev] as string[]), value]
    }));
  };
  const handleContactsFilterRemove = (type: string, value: string) => {
    setContactsFilters(prev => ({
      ...prev,
      [type]: (prev[type as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reportes"
        description="Genera reportes globales o individuales sobre programas, actores y contactos de la fundación"
      />
      
      <ReportConfiguration 
        reportType={reportType}
        onReportTypeChange={setReportType}
        selectedProgram={selectedProgram}
        onSelectedProgramChange={setSelectedProgram}
        selectedActor={selectedActor}
        onSelectedActorChange={setSelectedActor}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        programs={programsList}
        actors={actorsList}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <ReportCard
          title={reportType === 'global' ? "Reporte Global de Programas" : "Reporte Individual de Programa"}
          description={
            reportType === 'global' 
              ? "Información completa sobre todos los programas, incluyendo avance presupuestal, indicadores técnicos, metas, actores involucrados y estado de ejecución."
              : "Reporte detallado del programa seleccionado con toda su información específica, exportado en el formato elegido."
          }
          icon={<FolderKanban className="h-6 w-6 text-primary" />}
          onDownload={handleDownloadProgramsReport}
          isLoading={loadingPrograms || (reportType === 'global' ? isLoadingGlobalPrograms : isLoadingIndividualProgram)}
          dataCount={getProgramsDataCount()}
          buttonText={getProgramsButtonText()}
          disabled={isProgramsDisabled()}
        />
        
        <ReportCard
          title={reportType === 'global' ? "Reporte Global de Actores" : "Reporte Individual de Actor"}
          description={
            reportType === 'global'
              ? "Información detallada sobre todos los actores, incluyendo matriz de influencia-interés, ubicación territorial, tipo de relación con la fundación y programas asociados."
              : "Reporte detallado del actor seleccionado con toda su información específica, exportado en el formato elegido."
          }
          icon={<Users className="h-6 w-6 text-primary" />}
          onDownload={handleDownloadActorsReport}
          isLoading={loadingActors || (reportType === 'global' ? isLoadingGlobalActors : isLoadingIndividualActor)}
          dataCount={getActorsDataCount()}
          buttonText={getActorsButtonText()}
          disabled={isActorsDisabled()}
        />

        {reportType === 'global' && (
          <>
            <ReportCard
              title="Reporte Global de Contactos"
              description="Exporta el listado completo de contactos con cargo, datos de contacto, actor relacionado, municipio de incidencia y equipo de vinculación."
              icon={<Contact className="h-6 w-6 text-primary" />}
              onDownload={handleDownloadContactsReport}
              isLoading={loadingContacts || isLoadingGlobalContacts}
              dataCount={globalContactsData.length}
              buttonText="Descargar Reporte Global"
            />

          </>
        )}
      </div>

      {reportType === 'global' && (
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Información sobre los reportes globales</h3>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Reporte Global de Programas incluye:</h4>
              <ul className="space-y-1">
                <li>• Información general del programa</li>
                <li>• Seguimiento presupuestal detallado</li>
                <li>• Indicadores técnicos y su cumplimiento</li>
                <li>• Actores involucrados por programa</li>
                <li>• Estados y fechas de ejecución</li>
                <li>• Formato: Excel (.xlsx)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Reporte Global de Actores incluye:</h4>
              <ul className="space-y-1">
                <li>• Información básica y de contacto</li>
                <li>• Posición en matriz influencia-interés</li>
                <li>• Estrategia recomendada de gestión</li>
                <li>• Ubicación territorial de actuación</li>
                <li>• Programas en los que participa</li>
                <li>• Formato: Excel (.xlsx)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {reportType === 'global' && (
        <>
          <AdvancedFilters 
            onDownloadFiltered={handleDownloadFilteredReport}
            isLoading={isLoadingFiltered}
            programs={programsList}
            actors={actorsList}
            activeMunicipios={activeMunicipios}
            filters={advancedFilters}
            onFilterChange={handleFilterChange}
            onFilterRemove={handleFilterRemove}
            filteredDataCount={filteredData.length}
            hasError={!!filteredError}
            onSinContactosChange={(value) => handleFilterChange('sinContactos', value)}
          />

          <ContactsAdvancedFilters
            onDownloadFiltered={handleDownloadFilteredContactsReport}
            isLoading={isLoadingFilteredContacts}
            actors={actorsList}
            filters={contactsFilters}
            onFilterChange={handleContactsFilterChange}
            onFilterRemove={handleContactsFilterRemove}
            filteredDataCount={filteredContactsData.length}
            hasError={!!filteredContactsError}
            totalContacts={globalContactsData.length}
            lastUpdatedAt={contactsTraceability.lastUpdatedAt}
            lastUpdatedBy={contactsTraceability.lastUpdatedBy}
          />

          <ProgramsAdvancedFilters
            filters={programsFilters}
            onFilterChange={handleProgramsFilterChange}
            onFilterRemove={handleProgramsFilterRemove}
            ejes={ejesEstrategicos}
            programs={programsList}
            actors={actorsList}
            filteredCount={filteredProgramsData.length}
            totalPrograms={globalProgramsData.length}
            isLoading={isLoadingFilteredPrograms}
            hasError={!!filteredProgramsError}
            lastUpdatedAt={programsTraceability.lastUpdatedAt}
            lastUpdatedBy={programsTraceability.lastUpdatedBy}
            onExportIndicators={() => exportIndicators(filteredProgramsData, programsFilters, user?.email || null)}
            onExportBudget={() => exportBudget(filteredProgramsData, programsFilters, user?.email || null)}
            onExportActors={() => exportActorsByProgram(filteredProgramsData, programsFilters, user?.email || null)}
            onExportSynergy={() => exportSynergy(filteredProgramsData, programsFilters, user?.email || null)}
          />
        </>
      )}
    </div>
  );
}
