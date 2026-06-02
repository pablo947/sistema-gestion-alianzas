import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const STRATEGY_QUADRANTS = [
  'Gestionar de Cerca',
  'Mantener Satisfechos',
  'Mantener Informados',
  'Monitorear',
] as const;

const getStrategy = (influencia: number | null, interes: number | null): string => {
  if (!influencia || !interes) return 'Sin clasificar';
  if (influencia >= 4 && interes >= 4) return 'Gestionar de Cerca';
  if (influencia <= 2 && interes >= 4) return 'Mantener Satisfechos';
  if (influencia >= 4 && interes <= 2) return 'Mantener Informados';
  return 'Monitorear';
};

const buildInfoSheet = (
  reportName: string,
  filters: any,
  recordCount: number,
  userEmail: string | null
) => {
  const now = new Date();
  const filterEntries: string[] = [];
  if (filters.ejeEstrategico?.length) filterEntries.push(`Ejes: ${filters.ejeEstrategico.join(', ')}`);
  if (filters.proyecto?.length) filterEntries.push(`Proyectos: ${filters.proyecto.length} seleccionados`);
  if (filters.actor?.length) filterEntries.push(`Actores: ${filters.actor.length} seleccionados`);
  if (filters.anio?.length) filterEntries.push(`Años: ${filters.anio.join(', ')}`);

  return XLSX.utils.json_to_sheet([
    { Campo: 'Reporte', Valor: reportName },
    { Campo: 'Plataforma', Valor: 'Sistema de Gestión de Alianzas y Proyectos - Fundación Luker' },
    { Campo: 'Fecha de generación', Valor: now.toLocaleDateString('es-CO') },
    { Campo: 'Hora de generación', Valor: now.toLocaleTimeString('es-CO') },
    { Campo: 'Usuario', Valor: userEmail || 'N/A' },
    { Campo: 'Registros incluidos', Valor: recordCount },
    { Campo: 'Filtros aplicados', Valor: filterEntries.join(' | ') || 'Ninguno' },
  ]);
};

export const useProjectsAdvancedExport = () => {
  const { toast } = useToast();

  const downloadWorkbook = (workbook: XLSX.WorkBook, filename: string) => {
    XLSX.writeFile(workbook, filename);
  };

  // 1. Indicadores por Proyecto
  const exportIndicators = (projects: any[], filters: any, userEmail: string | null) => {
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, buildInfoSheet('Indicadores por Proyecto', filters, projects.length, userEmail), 'Info');

      const groupByCategory = (categoria: string) => {
        const rows: any[] = [];
        projects.forEach(p => {
          const metas = Array.isArray(p.metas) ? p.metas : [];
          metas
            .filter((m: any) => (m.categoria || m.tipo || '').toLowerCase() === categoria.toLowerCase())
            .forEach((m: any) => {
              const meta = parseFloat(m.meta) || 0;
              const avance = parseFloat(m.avance_actual ?? m.avance) || 0;
              const cumplimiento = meta > 0 ? Math.round((avance / meta) * 100) : 0;
              rows.push({
                'Eje Estratégico': p.eje_estrategico || 'N/A',
                'Proyecto': p.nombre,
                'Categoría': categoria,
                'Indicador': m.indicador || '',
                'Meta': m.meta || '',
                'Unidad': m.unidad || '',
                'Avance Actual': avance,
                '% Cumplimiento': cumplimiento + '%',
                'Estado': cumplimiento >= 90 ? 'Verde' : cumplimiento >= 70 ? 'Amarillo' : 'Rojo',
                'Fecha Límite': m.fecha_limite || '',
                'Frecuencia Reporte': m.frecuencia_reporte || '',
              });
            });
        });
        return rows;
      };

      ['Gestión', 'Resultado', 'Impacto'].forEach(cat => {
        const rows = groupByCategory(cat);
        if (rows.length > 0) {
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), cat);
        }
      });

      downloadWorkbook(wb, `Indicadores_Proyectos_Luker_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({ title: 'Reporte generado', description: 'Indicadores por proyecto descargados.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo generar el reporte de indicadores.', variant: 'destructive' });
    }
  };

  // 2. Ejecución Presupuestal
  const exportBudget = (projects: any[], filters: any, userEmail: string | null) => {
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, buildInfoSheet('Ejecución Presupuestal', filters, projects.length, userEmail), 'Info');

      const rows = projects.map(p => {
        const total = Number(p.presupuesto_total) || 0;
        const ejecutado = Number(p.presupuesto_ejecutado) || 0;
        const ejecucion = total > 0 ? Math.round((ejecutado / total) * 100) : 0;
        return {
          'Eje Estratégico': p.eje_estrategico || 'N/A',
          'Proyecto': p.nombre,
          
          'Estado': p.estado,
          'Fecha Inicio': p.fecha_inicio || '',
          'Fecha Cierre': p.fecha_cierre || '',
          'Presupuesto Total': total,
          'Presupuesto Ejecutado': ejecutado,
          'Saldo': total - ejecutado,
          '% Ejecución': ejecucion + '%',
          'Semáforo': ejecucion >= 90 ? 'Verde' : ejecucion >= 70 ? 'Amarillo' : 'Rojo',
        };
      });

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Ejecución Presupuestal');
      downloadWorkbook(wb, `Ejecucion_Presupuestal_Luker_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({ title: 'Reporte generado', description: 'Ejecución presupuestal descargada.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo generar el reporte de presupuesto.', variant: 'destructive' });
    }
  };

  // 3. Actores Atados a Proyectos (por cuadrante)
  const exportActorsByProject = (projects: any[], filters: any, userEmail: string | null) => {
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, buildInfoSheet('Actores por Proyecto (cuadrantes)', filters, projects.length, userEmail), 'Info');

      const rows: any[] = [];
      projects.forEach(p => {
        (p.actor_projects || []).forEach((ap: any) => {
          const actor = ap.actors;
          if (!actor) return;
          rows.push({
            'Eje Estratégico': p.eje_estrategico || 'N/A',
            'Proyecto': p.nombre,
            'Estrategia (Cuadrante)': getStrategy(actor.nivel_influencia, actor.nivel_interes),
            'Actor': actor.nombre_actor,
            'Sector': actor.sector_actor || '',
            'Nivel Influencia': actor.nivel_influencia ?? 'N/A',
            'Nivel Interés': actor.nivel_interes ?? 'N/A',
          });
        });
      });

      // Sort by quadrant order then by project
      const order = new Map(STRATEGY_QUADRANTS.map((q, i) => [q, i]));
      rows.sort((a, b) => {
        const oa = order.get(a['Estrategia (Cuadrante)']) ?? 99;
        const ob = order.get(b['Estrategia (Cuadrante)']) ?? 99;
        if (oa !== ob) return oa - ob;
        return String(a.Proyecto).localeCompare(String(b.Proyecto));
      });

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Actores por Cuadrante');

      // One sheet per quadrant
      STRATEGY_QUADRANTS.forEach(q => {
        const filtered = rows.filter(r => r['Estrategia (Cuadrante)'] === q);
        if (filtered.length > 0) {
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filtered), q.substring(0, 31));
        }
      });

      downloadWorkbook(wb, `Actores_Proyectos_Luker_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({ title: 'Reporte generado', description: 'Actores por proyecto descargados.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo generar el reporte de actores por proyecto.', variant: 'destructive' });
    }
  };

  // 4. Sinergia de Actores
  const exportSynergy = (projects: any[], filters: any, userEmail: string | null) => {
    try {
      const wb = XLSX.utils.book_new();

      const actorMap = new Map<string, { actor: any; projects: string[]; ejes: Set<string> }>();
      projects.forEach(p => {
        (p.actor_projects || []).forEach((ap: any) => {
          const a = ap.actors;
          if (!a) return;
          if (!actorMap.has(a.actor_id)) {
            actorMap.set(a.actor_id, { actor: a, projects: [], ejes: new Set() });
          }
          const entry = actorMap.get(a.actor_id)!;
          entry.projects.push(p.nombre);
          if (p.eje_estrategico) entry.ejes.add(p.eje_estrategico);
        });
      });

      const synergyRows = Array.from(actorMap.values())
        .filter(e => e.projects.length > 1)
        .sort((a, b) => b.projects.length - a.projects.length)
        .map(e => ({
          'Actor': e.actor.nombre_actor,
          'Sector': e.actor.sector_actor || '',
          'Estrategia': getStrategy(e.actor.nivel_influencia, e.actor.nivel_interes),
          'N° Proyectos': e.projects.length,
          'N° Ejes Estratégicos': e.ejes.size,
          'Ejes Cubiertos': Array.from(e.ejes).join(', '),
          'Proyectos': e.projects.join(' | '),
          'Nivel de Vinculación': e.projects.length >= 4 ? 'Alto' : e.projects.length >= 2 ? 'Medio' : 'Bajo',
        }));

      XLSX.utils.book_append_sheet(wb, buildInfoSheet('Sinergia de Actores', filters, synergyRows.length, userEmail), 'Info');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(synergyRows), 'Sinergia');

      downloadWorkbook(wb, `Sinergia_Actores_Luker_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast({ title: 'Reporte generado', description: `Sinergia: ${synergyRows.length} actores en múltiples proyectos.` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo generar el reporte de sinergia.', variant: 'destructive' });
    }
  };

  return { exportIndicators, exportBudget, exportActorsByProject, exportSynergy };
};
