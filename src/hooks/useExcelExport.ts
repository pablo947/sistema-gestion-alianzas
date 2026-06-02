
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export const useExcelExport = () => {
  const { toast } = useToast();
  const { data: teamMembers = [] } = useTeamMembers();

  const responsableMap = new Map(
    teamMembers.map((tm: any) => [tm.id, `${tm.nombre || ''} ${tm.apellidos || ''}`.trim()])
  );

  const formatResponsables = (value: any): string => {
    if (!value) return '';
    const ids: string[] = Array.isArray(value)
      ? value
      : typeof value === 'string' ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];
    return ids.map((id) => responsableMap.get(id) || '').filter(Boolean).join(', ');
  };

  const exportProjectsReport = (data: any[]) => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Hoja 1 - Información General de Proyectos
      const generalData = data.map(project => ({
        'Eje Estratégico': project.eje_estrategico || 'Sin clasificar',
        'ID Proyecto': project.proyecto_id,
        'Nombre': project.nombre,
        'Eje': project.eje_estrategico || 'Sin clasificar',
        'Estado': project.estado,
        'Objetivos': project.objetivos || '',
        'Resultados': project.resultados || '',
        'Fecha Inicio': project.fecha_inicio || '',
        'Fecha Cierre': project.fecha_cierre || '',
        'Presupuesto Total': project.presupuesto_total || 0,
        'Presupuesto Ejecutado': project.presupuesto_ejecutado || 0,
        '% Ejecución Presupuestal': project.budgetExecution + '%',
        'Total Indicadores': project.totalIndicators,
        'Indicadores Completados': project.completedIndicators,
        '% Cumplimiento Indicadores': project.indicatorCompletion + '%',
        'Actores Involucrados': project.actorsInvolved,
        'Fecha Creación': project.created_at
      }));
      
      const generalSheet = XLSX.utils.json_to_sheet(generalData);
      XLSX.utils.book_append_sheet(workbook, generalSheet, 'Información General');
      
      // Hoja 2 - Indicadores Técnicos
      const indicatorsData: any[] = [];
      data.forEach(project => {
        if (Array.isArray(project.metas)) {
          project.metas.forEach((indicator: any) => {
            const target = parseFloat(indicator.meta) || 0;
            const progress = parseFloat(indicator.avance_actual) || 0;
            const completion = target > 0 ? Math.round((progress / target) * 100) : 0;
            
            indicatorsData.push({
              'Eje Estratégico': project.eje_estrategico || 'Sin clasificar',
              'Proyecto': project.nombre,
              'Código Indicador': indicator.id || '',
              'Descripción': indicator.indicador || '',
              'Tipo': indicator.tipo || '',
              'Meta': indicator.meta || '',
              'Unidad': indicator.unidad || '',
              'Avance Actual': indicator.avance_actual || 0,
              '% Cumplimiento': completion + '%',
              'Fecha Límite': indicator.fecha_limite || '',
              'Frecuencia Reporte': indicator.frecuencia_reporte || '',
              'Ejes que Reportan': Array.isArray(indicator.areas_reportan) ? indicator.areas_reportan.join(', ') : ''

            });
          });
        }
      });
      
      if (indicatorsData.length > 0) {
        const indicatorsSheet = XLSX.utils.json_to_sheet(indicatorsData);
        XLSX.utils.book_append_sheet(workbook, indicatorsSheet, 'Indicadores Técnicos');
      }
      
      // Generar y descargar archivo
      const fileName = `Reporte_Proyectos_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Reporte generado",
        description: "El reporte de proyectos se ha descargado exitosamente.",
      });
    } catch (error) {
      console.error('Error generating projects report:', error);
      toast({
        title: "Error",
        description: "Hubo un error al generar el reporte de proyectos.",
        variant: "destructive",
      });
    }
  };

  const exportActorsReport = (data: any[]) => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Función para obtener descripción de nivel de influencia/interés
      const getNivelDescripcion = (nivel: number | null): string => {
        if (!nivel) return 'No definido';
        if (nivel <= 2) return `${nivel} - Bajo`;
        if (nivel <= 3) return `${nivel} - Medio`;
        return `${nivel} - Alto`;
      };
      
      // Hoja 1 - Información General de Actores
      const generalData = data.map(actor => ({
        'ID Actor': actor.actor_id,
        'Nombre': actor.nombre_actor,
        'Sector': actor.sector_actor,
        'Ciudad Sede': actor.ciudad_sede || '',
        'Teléfono Entidad': actor.telefono_entidad || '',
        'Dirección Entidad': actor.direccion_entidad || '',
        'Correo Entidad': actor.correo_entidad || '',
        'Alcance Territorial': actor.alcance_territorial || '',
        'Tipo de Relación': actor.relationTypes,
        
        'Nivel de Influencia': getNivelDescripcion(actor.nivel_influencia),
        'Nivel de Interés': getNivelDescripcion(actor.nivel_interes),
        'Responsables Seguimiento': formatResponsables(actor.responsable_seguimiento),
        'Municipios Actuación': actor.municipalities,
        'Departamentos Actuación': actor.departments,
        'Proyectos Involucrados': actor.projectsInvolved,
        'Ejes Involucrados': actor.ejesInvolved || '',

        'Años de Alianza Activa': actor.aniosAlianza || '',
        'Índice de Importancia (0-100)': actor.importance_index ?? '',
        'Puntaje Matriz Interna': actor.importance_internal ?? '',
        'Puntaje SNA': actor.importance_sna ?? '',
      }));

      
      const generalSheet = XLSX.utils.json_to_sheet(generalData);
      XLSX.utils.book_append_sheet(workbook, generalSheet, 'Información General');
      
      // Hoja 2 - Matriz Influencia-Interés
      const matrixData = data.map(actor => ({
        'Nombre Actor': actor.nombre_actor,
        'Sector': actor.sector_actor,
        'Nivel Influencia': getNivelDescripcion(actor.nivel_influencia),
        'Nivel Interés': getNivelDescripcion(actor.nivel_interes),
        'Estrategia Recomendada': actor.strategy,
        'Ciudad Sede': actor.ciudad_sede || '',
        'Municipios Actuación': actor.municipalities,
        'Tipo de Relación': actor.relationTypes
      }));
      
      const matrixSheet = XLSX.utils.json_to_sheet(matrixData);
      XLSX.utils.book_append_sheet(workbook, matrixSheet, 'Matriz Influencia-Interés');
      
      // Hoja 3 - Contactos Asociados
      const contactsData: any[] = [];
      data.forEach((actor) => {
        const contacts = actor.contacts || [];
        contacts.forEach((contact: any) => {
          contactsData.push({
            'No.': contactsData.length + 1,
            'Actor Asociado': actor.nombre_actor || 'N/A',
            'Sector del Actor': actor.sector_actor || 'N/A',
            'Nombre Completo': `${contact.nombre || ''} ${contact.apellidos || ''}`.trim() || 'N/A',
            'Nombre': contact.nombre || 'N/A',
            'Apellidos': contact.apellidos || 'N/A',
            'Cargo': contact.cargo || 'N/A',
            'Correo Electrónico': contact.correo || 'N/A',
            'Teléfono/Celular': contact.telefono || 'N/A',
            'Ciudad': contact.ciudad || 'N/A',
            'Notas': contact.notas || 'N/A',
            'Responsable de Seguimiento': formatResponsables(contact.responsable_seguimiento) || 'N/A'
          });
        });
      });
      
      if (contactsData.length > 0) {
        const contactsSheet = XLSX.utils.json_to_sheet(contactsData);
        XLSX.utils.book_append_sheet(workbook, contactsSheet, 'Contactos Asociados');
      }
      
      // Generar y descargar archivo
      const fileName = `Reporte_Actores_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Reporte generado",
        description: `El reporte de actores se ha descargado exitosamente con ${data.length} actores y ${contactsData.length} contactos.`,
      });
    } catch (error) {
      console.error('Error generating actors report:', error);
      toast({
        title: "Error",
        description: "Hubo un error al generar el reporte de actores.",
        variant: "destructive",
      });
    }
  };

  const exportFilteredReport = (data: any[], filters: any) => {
    try {
      const workbook = XLSX.utils.book_new();

      // Función para obtener descripción de nivel de influencia/interés
      const getNivelDescripcion = (nivel: number | null): string => {
        if (!nivel) return 'No definido';
        if (nivel <= 2) return `${nivel} - Bajo`;
        if (nivel <= 3) return `${nivel} - Medio`;
        return `${nivel} - Alto`;
      };

      // Función para obtener estrategia según niveles de influencia e interés
      const getStrategy = (influencia: number | null, interes: number | null): string => {
        if (!influencia || !interes) return 'No definido';
        if (influencia >= 4 && interes >= 4) return 'Gestionar de Cerca';
        if (influencia <= 2 && interes >= 4) return 'Mantener Satisfechos';
        if (influencia >= 4 && interes <= 2) return 'Mantener Informados';
        return 'Monitorear';
      };

      // Preparar datos de actores filtrados con información mejorada
      const actorsData = data.map((actor, index) => {
        const contacts = actor.contacts || [];
        const actorPrograms = actor.actor_programs || [];
        // Información de proyectos asociados (incluye eje inferido)
        const projectsInfo = actorPrograms.map((ap: any) => {
          const program = ap.programs;
          if (!program) return 'N/A';
          const eje = program.eje_estrategico || 'Sin eje';
          return `${program.nombre} [${eje}]`;
        }).join('; ');

        // Ejes únicos asociados al actor (vía proyectos)
        const actorEjes = Array.from(new Set(
          actorPrograms.map((ap: any) => ap.programs?.eje_estrategico).filter(Boolean)
        )).join(', ');

        return {
          'No.': index + 1,
          'Nombre del Actor': actor.nombre_actor || 'N/A',
          'Sector': actor.sector_actor || 'N/A',
          'Alcance Territorial': actor.alcance_territorial || 'N/A',
          'Ciudad Sede': actor.ciudad_sede || 'N/A',
          'Teléfono Entidad': (actor as any).telefono_entidad || 'N/A',
          'Dirección Entidad': (actor as any).direccion_entidad || 'N/A',
          'Correo Entidad': (actor as any).correo_entidad || 'N/A',
          'Municipios de Actuación': Array.isArray(actor.municipio_actuacion)
            ? actor.municipio_actuacion.join(', ')
            : actor.municipio_actuacion || 'N/A',
          'Departamentos de Actuación': Array.isArray(actor.departamento_actuacion)
            ? actor.departamento_actuacion.join(', ')
            : actor.departamento_actuacion || 'N/A',
          'Tipo de Relación': Array.isArray(actor.tipo_relacion)
            ? actor.tipo_relacion.join(', ')
            : actor.tipo_relacion || 'N/A',

          'Nivel de Influencia': getNivelDescripcion(actor.nivel_influencia),
          'Nivel de Interés': getNivelDescripcion(actor.nivel_interes),
          'Estrategia': getStrategy(actor.nivel_influencia, actor.nivel_interes),
          'Contactos Asociados': contacts.length,
          'Proyectos Asociados': actorPrograms.length,
          'Ejes Involucrados': actorEjes || 'N/A',
          'Detalles de Proyectos': projectsInfo || 'N/A',

          'Años de Alianza Activa': Array.isArray((actor as any).anios_alianza) 
            ? (actor as any).anios_alianza.join(', ') : 'N/A',
          'Responsable de Seguimiento': formatResponsables(actor.responsable_seguimiento) || 'N/A'
        };
      });

      // Preparar datos de contactos relacionados con información mejorada
      const contactsData: any[] = [];
      data.forEach((actor) => {
        const contacts = actor.contacts || [];
        contacts.forEach((contact: any) => {
          contactsData.push({
            'No.': contactsData.length + 1,
            'Actor Asociado': actor.nombre_actor || 'N/A',
            'Sector del Actor': actor.sector_actor || 'N/A',
            'Nombre Completo': `${contact.nombre || ''} ${contact.apellidos || ''}`.trim() || 'N/A',
            'Nombre': contact.nombre || 'N/A',
            'Apellidos': contact.apellidos || 'N/A',
            'Cargo': contact.cargo || 'N/A',
            'Correo Electrónico': contact.correo || 'N/A',
            'Teléfono/Celular': contact.telefono || 'N/A',
            'Ciudad': contact.ciudad || 'N/A',
            'Notas': contact.notas || 'N/A',
            'Responsable de Seguimiento del Contacto': formatResponsables(contact.responsable_seguimiento) || 'N/A'
          });
        });
      });

      // Crear hojas del libro
      const actorsSheet = XLSX.utils.json_to_sheet(actorsData);
      const contactsSheet = XLSX.utils.json_to_sheet(contactsData);

      // Agregar información de filtros aplicados como primera fila
      const filterInfo = [];
      if (filters.municipio?.length) filterInfo.push(`Municipios: ${filters.municipio.join(', ')}`);
      if (filters.tipoRelacion?.length) filterInfo.push(`Tipo Relación: ${filters.tipoRelacion.join(', ')}`);
      if (filters.eje?.length) filterInfo.push(`Ejes: ${filters.eje.join(', ')}`);
      if (filters.proyecto?.length) filterInfo.push(`Proyectos: ${filters.proyecto.length} seleccionados`);
      if (filters.actor?.length) filterInfo.push(`Actores: ${filters.actor.length} seleccionados`);
      if (filters.sinContactos) filterInfo.push(`Solo actores sin contactos asociados`);
      if (filters.estrategia?.length) filterInfo.push(`Estrategias: ${filters.estrategia.join(', ')}`);

      XLSX.utils.book_append_sheet(workbook, actorsSheet, 'Actores Filtrados');
      XLSX.utils.book_append_sheet(workbook, contactsSheet, 'Contactos Relacionados');

      // Generar nombre del archivo con timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `reporte_filtrado_${timestamp}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Reporte descargado",
        description: `Se ha generado el archivo ${fileName} con ${data.length} actores y ${contactsData.length} contactos. Filtros aplicados: ${filterInfo.join('; ') || 'Ninguno'}.`
      });
    } catch (error) {
      console.error('Error al exportar reporte filtrado:', error);
      toast({
        title: "Error al exportar",
        description: "Hubo un error al generar el archivo Excel.",
        variant: "destructive"
      });
    }
  };

  const exportIndividualProjectReport = (data: any) => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Hoja 1 - Información General del Proyecto
      const generalData = [{
        'ID Proyecto': data.proyecto_id,
        'Nombre': data.nombre,
        'Eje': data.eje_estrategico || 'Sin clasificar',
        'Estado': data.estado,
        'Objetivos': data.objetivos || '',
        'Resultados': data.resultados || '',
        'Fecha Inicio': data.fecha_inicio || '',
        'Fecha Cierre': data.fecha_cierre || '',
        'Presupuesto Total': data.presupuesto_total || 0,
        'Presupuesto Ejecutado': data.presupuesto_ejecutado || 0,
        '% Ejecución Presupuestal': data.budgetExecution + '%',
        'Total Indicadores': data.totalIndicators,
        'Indicadores Completados': data.completedIndicators,
        '% Cumplimiento Indicadores': data.indicatorCompletion + '%',
        'Actores Relacionados': data.relatedActors?.length || 0,
        'Fecha Creación': data.created_at
      }];
      
      const generalSheet = XLSX.utils.json_to_sheet(generalData);
      XLSX.utils.book_append_sheet(workbook, generalSheet, 'Información General');
      
      // Hoja 2 - Indicadores Técnicos
      const indicatorsData: any[] = [];
      if (Array.isArray(data.metas)) {
        data.metas.forEach((indicator: any) => {
          const target = parseFloat(indicator.meta) || 0;
          const progress = parseFloat(indicator.avance) || 0;
          const completion = target > 0 ? Math.round((progress / target) * 100) : 0;
          
          indicatorsData.push({
            'Código Indicador': indicator.id || '',
            'Descripción': indicator.indicador || '',
            'Tipo': indicator.tipo || '',
            'Meta': indicator.meta || '',
            'Unidad': indicator.unidad || '',
            'Avance Actual': indicator.avance || 0,
            '% Cumplimiento': completion + '%',
            'Fecha Límite': indicator.fecha_limite || '',
            'Frecuencia Reporte': indicator.frecuencia_reporte || '',
            'Áreas que Reportan': Array.isArray(indicator.areas_reportan) ? indicator.areas_reportan.join(', ') : ''
          });
        });
      }
      
      if (indicatorsData.length > 0) {
        const indicatorsSheet = XLSX.utils.json_to_sheet(indicatorsData);
        XLSX.utils.book_append_sheet(workbook, indicatorsSheet, 'Indicadores Técnicos');
      }
      
      // Hoja 3 - Actores Relacionados
      if (data.relatedActors && data.relatedActors.length > 0) {
        const actorsData = data.relatedActors.map((actor: any) => ({
          'Nombre Actor': actor.nombre_actor || '',
          'Sector': actor.sector_actor || '',
          'Ciudad Sede': actor.ciudad_sede || '',
          'Nivel Influencia': actor.nivel_influencia || 'N/A',
          'Nivel Interés': actor.nivel_interes || 'N/A',
          'Tipo Relación': Array.isArray(actor.tipo_relacion) ? actor.tipo_relacion.join(', ') : actor.tipo_relacion || ''
        }));
        
        const actorsSheet = XLSX.utils.json_to_sheet(actorsData);
        XLSX.utils.book_append_sheet(workbook, actorsSheet, 'Actores Relacionados');
      }
      
      // Generar y descargar archivo
      const fileName = `Reporte_Proyecto_${data.nombre.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Reporte generado",
        description: "El reporte del proyecto se ha descargado exitosamente.",
      });
    } catch (error) {
      console.error('Error generating individual project report:', error);
      toast({
        title: "Error",
        description: "Hubo un error al generar el reporte del proyecto.",
        variant: "destructive",
      });
    }
  };

  const sanitizeCargo = (cargo: any): string => {
    const value = typeof cargo === 'string' ? cargo.trim() : '';
    if (!value) return '';
    if (/@/.test(value) || /\.(com|org|edu|co|gov|net)\b/i.test(value)) {
      return `(revisar: posible correo) ${value}`;
    }
    return value;
  };

  const exportContactsReport = (data: any[]) => {
    try {
      const workbook = XLSX.utils.book_new();

      // Auditoría en consola: detectar datos sucios en `cargo`
      const emptyCargo = data.filter(c => !c.cargo || !String(c.cargo).trim()).length;
      const suspiciousCargo = data.filter(c => typeof c.cargo === 'string' && /@/.test(c.cargo));
      console.info(`[ReporteContactos] Total: ${data.length} | Cargo vacío: ${emptyCargo} | Cargo con '@': ${suspiciousCargo.length}`);
      if (suspiciousCargo.length > 0) {
        console.warn('[ReporteContactos] Contactos con posible correo en Cargo:', suspiciousCargo.map((c: any) => ({ id: c.contact_id, nombre: c.nombreCompleto, cargo: c.cargo })));
      }

      const contactsData = data.map((contact, index) => ({
        'No.': index + 1,
        'Actor Relacionado': String(contact.actorNombre || ''),
        'Nombre Completo': String(contact.nombreCompleto || ''),
        'Cargo / Rol': sanitizeCargo(contact.cargo),
        'Nivel de Dirección': String(contact.nivel_direccion || 'Sin clasificar'),
        'Redes Alumni': Array.isArray(contact.tipo_contacto)
          ? contact.tipo_contacto.join(', ')
          : String(contact.tipo_contacto || ''),
        'Municipios de Incidencia': String(contact.municipios || ''),
        'Tipo de Relación': String(contact.actorTipoRelacion || ''),
        'Correo Electrónico': String(contact.correo || ''),
        'Teléfono': String(contact.telefono || ''),
        'Teléfono Entidad': String(contact.actorTelefono || ''),
        'Dirección Entidad': String(contact.actorDireccion || ''),
        'Correo Entidad': String(contact.actorCorreo || ''),
        'Años de Alianza Activa': String(contact.actorAniosAlianza || ''),
        'Sector del Actor': String(contact.actorSector || ''),
        'Departamentos (Actor)': String(contact.departamentos || ''),
        'Ejes (Proyectos del Actor)': String(contact.ejes || ''),
        'Proyectos del Actor': String(contact.proyectos || ''),

        'Responsable de Seguimiento': formatResponsables(contact.responsable_seguimiento),
        'Notas': String(contact.notas || ''),
      }));

      const sheet = XLSX.utils.json_to_sheet(contactsData);

      // Anchos de columna mínimos para evitar lecturas erróneas por columnas angostas
      sheet['!cols'] = [
        { wch: 5 },   // No.
        { wch: 32 },  // Actor Relacionado
        { wch: 28 },  // Nombre Completo
        { wch: 30 },  // Cargo / Rol
        { wch: 24 },  // Redes Alumni
        { wch: 28 },  // Municipios
        { wch: 22 },  // Tipo Relación
        { wch: 32 },  // Correo Electrónico
        { wch: 18 },  // Teléfono
        { wch: 18 },  // Teléfono Entidad
        { wch: 30 },  // Dirección Entidad
        { wch: 32 },  // Correo Entidad
        { wch: 18 },  // Años Alianza
        { wch: 22 },  // Sector
        { wch: 26 },  // Departamentos
        { wch: 26 },  // Áreas
        { wch: 28 },  // Responsable
        { wch: 30 },  // Notas
      ];

      // AutoFiltro en encabezados
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
      sheet['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: range.e.c, r: range.e.r } }) };

      XLSX.utils.book_append_sheet(workbook, sheet, 'Contactos');

      const now = new Date();
      const stamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
      const fileName = `Reporte_Contactos_${stamp}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Reporte generado",
        description: `El reporte de contactos se ha descargado exitosamente con ${data.length} registros.`,
      });
    } catch (error) {
      console.error('Error generating contacts report:', error);
      toast({
        title: "Error",
        description: "Hubo un error al generar el reporte de contactos.",
        variant: "destructive",
      });
    }
  };

  const exportFilteredContactsReport = (data: any[], filters: any) => {
    try {
      const workbook = XLSX.utils.book_new();

      const contactsData = data.map((contact: any, index: number) => ({
        'No.': index + 1,
        'Actor Relacionado': contact.actorNombre || 'N/A',
        'Nombre Completo': contact.nombreCompleto || 'N/A',
        'Cargo / Rol': contact.cargo || 'N/A',
        'Nivel de Dirección': contact.nivel_direccion || 'Sin clasificar',
        'Redes Alumni': Array.isArray(contact.tipo_contacto)
          ? contact.tipo_contacto.join(', ')
          : contact.tipo_contacto || 'N/A',
        'Municipios de Incidencia': contact.municipios || 'N/A',
        'Tipo de Relación': contact.actorTipoRelacion || 'N/A',
        'Correo Electrónico': contact.correo || 'N/A',
        'Teléfono': contact.telefono || 'N/A',
        'Teléfono Entidad': contact.actorTelefono || 'N/A',
        'Dirección Entidad': contact.actorDireccion || 'N/A',
        'Correo Entidad': contact.actorCorreo || 'N/A',
        'Años de Alianza Activa': contact.actorAniosAlianza || 'N/A',
        'Sector del Actor': contact.actorSector || 'N/A',
        'Responsable de Seguimiento': formatResponsables(contact.responsable_seguimiento) || 'N/A',
        'Notas': contact.notas || 'N/A',
      }));

      const sheet = XLSX.utils.json_to_sheet(contactsData);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Contactos Filtrados');

      const fileName = `Reporte_Contactos_Filtrado_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Reporte generado",
        description: `Reporte filtrado de contactos con ${data.length} registros.`,
      });
    } catch (error) {
      console.error('Error generating filtered contacts report:', error);
      toast({
        title: "Error",
        description: "Hubo un error al generar el reporte filtrado de contactos.",
        variant: "destructive",
      });
    }
  };

  return {
    exportProjectsReport,
    exportActorsReport,
    exportFilteredReport,
    exportIndividualProjectReport,
    exportContactsReport,
    exportFilteredContactsReport
  };
};
