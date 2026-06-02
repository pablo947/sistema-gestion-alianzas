import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel } from 'docx';
import { useToast } from "@/hooks/use-toast";

export const useDocumentExport = () => {
  const { toast } = useToast();

  const exportProjectAsDocx = async (projectData: any) => {
    try {
      console.log('Exporting project as DOCX:', projectData);
      
      if (!projectData) {
        throw new Error('No hay datos del proyecto para exportar');
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: `Reporte Individual - ${projectData.nombre || 'Sin nombre'}`,
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              text: `Eje: ${projectData.eje_estrategico || 'No especificada'}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Estado: ${projectData.estado || 'No especificado'}`,
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              text: "INFORMACIÓN GENERAL",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Objetivos: ", bold: true }),
                new TextRun(projectData.objetivos || 'No especificados'),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Resultados: ", bold: true }),
                new TextRun(projectData.resultados || 'No especificados'),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Fecha de Inicio: ", bold: true }),
                new TextRun(projectData.fecha_inicio || 'No especificada'),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Fecha de Cierre: ", bold: true }),
                new TextRun(projectData.fecha_cierre || 'No especificada'),
              ],
            }),
            
            new Paragraph({
              text: "SEGUIMIENTO PRESUPUESTAL",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Presupuesto Total: ", bold: true }),
                new TextRun(`$${(projectData.presupuesto_total || 0).toLocaleString()}`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Presupuesto Ejecutado: ", bold: true }),
                new TextRun(`$${(projectData.presupuesto_ejecutado || 0).toLocaleString()}`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Porcentaje de Ejecución: ", bold: true }),
                new TextRun(`${projectData.budgetExecution || 0}%`),
              ],
            }),
            
            new Paragraph({
              text: "INDICADORES TÉCNICOS",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Total de Indicadores: ", bold: true }),
                new TextRun((projectData.totalIndicators || 0).toString()),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Indicadores Completados: ", bold: true }),
                new TextRun((projectData.completedIndicators || 0).toString()),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Porcentaje de Cumplimiento: ", bold: true }),
                new TextRun(`${projectData.indicatorCompletion || 0}%`),
              ],
            }),

            // Agregar sección de actores relacionados si existen
            ...(projectData.relatedActors && projectData.relatedActors.length > 0 ? [
              new Paragraph({
                text: "ACTORES RELACIONADOS",
                heading: HeadingLevel.HEADING_1,
              }),
              ...projectData.relatedActors.map((actor: any) => 
                new Paragraph({
                  children: [
                    new TextRun({ text: `• ${actor.nombre_actor || 'Sin nombre'}`, bold: true }),
                    new TextRun(` - ${actor.sector_actor || 'Sin sector'} (${actor.ciudad_sede || 'Sin ciudad'})`),
                  ],
                })
              )
            ] : []),
          ],
        }],
      });

      console.log('Document created, generating blob...');
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Proyecto_${(projectData.nombre || 'Sin_nombre').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Document downloaded successfully');

      toast({
        title: "Reporte generado",
        description: "El reporte del proyecto se ha descargado exitosamente.",
      });
    } catch (error) {
      console.error('Error generating project document:', error);
      toast({
        title: "Error",
        description: `Hubo un error al generar el reporte del proyecto: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  const exportActorAsDocx = async (actorData: any) => {
    try {
      console.log('Exporting actor as DOCX:', actorData);
      
      if (!actorData) {
        throw new Error('No hay datos del actor para exportar');
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: `Reporte Individual - ${actorData.nombre_actor || 'Sin nombre'}`,
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              text: `Sector: ${actorData.sector_actor || 'No especificado'}`,
              spacing: { after: 200 },
            }),
            
            new Paragraph({
              text: "PERFIL GENERAL",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Ciudad Sede: ", bold: true }),
                new TextRun(actorData.ciudad_sede || 'No especificada'),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Alcance Territorial: ", bold: true }),
                new TextRun(actorData.alcance_territorial || 'No especificado'),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Municipios de Actuación: ", bold: true }),
                new TextRun(actorData.municipalities || 'No especificados'),
              ],
            }),
            
            new Paragraph({
              text: "MATRIZ INFLUENCIA-INTERÉS",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Nivel de Influencia: ", bold: true }),
                new TextRun((actorData.nivel_influencia || 'No definido').toString()),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Nivel de Interés: ", bold: true }),
                new TextRun((actorData.nivel_interes || 'No definido').toString()),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Estrategia Recomendada: ", bold: true }),
                new TextRun(actorData.strategy || 'No definida'),
              ],
            }),
            
            new Paragraph({
              text: "RELACIÓN CON LA FUNDACIÓN",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Tipo de Relación: ", bold: true }),
                new TextRun(actorData.relationTypes || 'No especificado'),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Responsables de Seguimiento: ", bold: true }),
                new TextRun(actorData.responsables || 'No especificados'),
              ],
            }),

            // Agregar sección de proyectos relacionados si existen
            ...(actorData.relatedProjects && actorData.relatedProjects.length > 0 ? [
              new Paragraph({
                text: "PROYECTOS RELACIONADOS",
                heading: HeadingLevel.HEADING_1,
              }),
              ...actorData.relatedProjects.map((project: any) => 
                new Paragraph({
                  children: [
                    new TextRun({ text: `• ${project.nombre || 'Sin nombre'}`, bold: true }),
                    new TextRun(` - ${project.eje_estrategico || 'Sin eje'} (${project.estado || 'Sin estado'})`),
                  ],
                })
              )
            ] : []),
          ],
        }],
      });

      console.log('Document created, generating blob...');
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Actor_${(actorData.nombre_actor || 'Sin_nombre').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Document downloaded successfully');

      toast({
        title: "Reporte generado",
        description: "El reporte del actor se ha descargado exitosamente.",
      });
    } catch (error) {
      console.error('Error generating actor document:', error);
      toast({
        title: "Error",
        description: `Hubo un error al generar el reporte del actor: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  const exportProjectAsMarkdown = (projectData: any) => {
    try {
      console.log('Exporting project as Markdown:', projectData);
      
      if (!projectData) {
        throw new Error('No hay datos del proyecto para exportar');
      }

      const markdown = `# Reporte Individual - ${projectData.nombre || 'Sin nombre'}

**Eje:** ${projectData.eje_estrategico || 'No especificada'}  
**Estado:** ${projectData.estado || 'No especificado'}

## INFORMACIÓN GENERAL

**Objetivos:** ${projectData.objetivos || 'No especificados'}

**Resultados:** ${projectData.resultados || 'No especificados'}

**Fecha de Inicio:** ${projectData.fecha_inicio || 'No especificada'}

**Fecha de Cierre:** ${projectData.fecha_cierre || 'No especificada'}

## SEGUIMIENTO PRESUPUESTAL

- **Presupuesto Total:** $${(projectData.presupuesto_total || 0).toLocaleString()}
- **Presupuesto Ejecutado:** $${(projectData.presupuesto_ejecutado || 0).toLocaleString()}
- **Porcentaje de Ejecución:** ${projectData.budgetExecution || 0}%

## INDICADORES TÉCNICOS

- **Total de Indicadores:** ${projectData.totalIndicators || 0}
- **Indicadores Completados:** ${projectData.completedIndicators || 0}
- **Porcentaje de Cumplimiento:** ${projectData.indicatorCompletion || 0}%

${projectData.relatedActors && projectData.relatedActors.length > 0 ? `
## ACTORES RELACIONADOS

${projectData.relatedActors.map((actor: any) => 
  `- **${actor.nombre_actor || 'Sin nombre'}** - ${actor.sector_actor || 'Sin sector'} (${actor.ciudad_sede || 'Sin ciudad'})`
).join('\n')}
` : ''}

---
*Reporte generado el ${new Date().toLocaleDateString()}*
`;

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Proyecto_${(projectData.nombre || 'Sin_nombre').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Markdown file downloaded successfully');

      toast({
        title: "Reporte generado",
        description: "El reporte del proyecto se ha descargado exitosamente.",
      });
    } catch (error) {
      console.error('Error generating project markdown:', error);
      toast({
        title: "Error",
        description: `Hubo un error al generar el reporte del proyecto: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  const exportActorAsMarkdown = (actorData: any) => {
    try {
      console.log('Exporting actor as Markdown:', actorData);
      
      if (!actorData) {
        throw new Error('No hay datos del actor para exportar');
      }

      const markdown = `# Reporte Individual - ${actorData.nombre_actor || 'Sin nombre'}

**Sector:** ${actorData.sector_actor || 'No especificado'}

## PERFIL GENERAL

- **Ciudad Sede:** ${actorData.ciudad_sede || 'No especificada'}
- **Alcance Territorial:** ${actorData.alcance_territorial || 'No especificado'}
- **Municipios de Actuación:** ${actorData.municipalities || 'No especificados'}

## MATRIZ INFLUENCIA-INTERÉS

- **Nivel de Influencia:** ${actorData.nivel_influencia || 'No definido'}
- **Nivel de Interés:** ${actorData.nivel_interes || 'No definido'}
- **Estrategia Recomendada:** ${actorData.strategy || 'No definida'}

## RELACIÓN CON LA FUNDACIÓN

- **Tipo de Relación:** ${actorData.relationTypes || 'No especificado'}

- **Responsables de Seguimiento:** ${actorData.responsables || 'No especificados'}

${actorData.relatedProjects && actorData.relatedProjects.length > 0 ? `
## PROYECTOS RELACIONADOS

${actorData.relatedProjects.map((project: any) => 
  `- **${project.nombre || 'Sin nombre'}** - ${project.eje_estrategico || 'Sin eje'} (${project.estado || 'Sin estado'})`
).join('\n')}
` : ''}

---
*Reporte generado el ${new Date().toLocaleDateString()}*
`;

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_Actor_${(actorData.nombre_actor || 'Sin_nombre').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Markdown file downloaded successfully');

      toast({
        title: "Reporte generado",
        description: "El reporte del actor se ha descargado exitosamente.",
      });
    } catch (error) {
      console.error('Error generating actor markdown:', error);
      toast({
        title: "Error",
        description: `Hubo un error al generar el reporte del actor: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    }
  };

  return {
    exportProjectAsDocx,
    exportActorAsDocx,
    exportProjectAsMarkdown,
    exportActorAsMarkdown
  };
};
