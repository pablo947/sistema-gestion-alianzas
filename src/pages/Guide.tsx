import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Users, FolderKanban, BarChart3, HelpCircle } from 'lucide-react';

export default function Guide() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader 
        title="Guía de Uso"
        description="Aprende a utilizar el Sistema de Gestión de Alianzas y Programas"
      />

      <div className="grid gap-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-luker-brown/10 rounded-lg">
                <Users className="w-5 h-5 text-luker-brown" />
              </div>
              <div>
                <CardTitle>Módulo de Actores y Contactos</CardTitle>
                <CardDescription>Gestión del ecosistema de aliados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Cómo crear un nuevo actor?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Para crear un nuevo actor, dirígete al módulo de <strong>Actores</strong> desde el menú principal. Haz clic en el botón "Nuevo Actor" en la esquina superior derecha. Llena la información básica como nombre, sector y nivel de influencia/interés. Recuerda que los niveles de influencia e interés determinarán la posición del actor en la Matriz Estratégica.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Relación entre Actores y Contactos</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Un <strong>Actor</strong> representa a una organización, empresa o entidad aliada. Un <strong>Contacto</strong> es una persona específica que pertenece a dicho actor. Siempre es recomendable crear primero el Actor y luego asociarle sus respectivos Contactos desde el módulo de información de contacto.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-luker-orange/10 rounded-lg">
                <FolderKanban className="w-5 h-5 text-luker-orange" />
              </div>
              <div>
                <CardTitle>Programas e Iniciativas</CardTitle>
                <CardDescription>Seguimiento de proyectos estratégicos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-3">
                <AccordionTrigger>Vinculación de Aliados a Programas</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Dentro del módulo de <strong>Programas e iniciativas</strong>, puedes seleccionar un programa específico y utilizar la pestaña de "Aliados" para agregar organizaciones que participan en el mismo. Esta vinculación es crucial para que el análisis de redes funcione correctamente.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-luker-teal/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-luker-teal" />
              </div>
              <div>
                <CardTitle>Análisis y Estrategia</CardTitle>
                <CardDescription>Uso de matrices y reportes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-4">
                <AccordionTrigger>Uso de la Matriz Influencia-Interés</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Ubicada en el módulo de <strong>Clasificación de Aliados</strong>, la matriz posiciona automáticamente a las organizaciones según el puntaje (1 al 5) asignado en su ficha. El objetivo es priorizar el relacionamiento con los actores en el cuadrante de "Gestionar de cerca".
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Descarga de Reportes</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  El módulo de <strong>Descarga de Reportes</strong> te permite exportar toda la base de datos de Actores, Contactos y Programas a un archivo Excel consolidado, ideal para informes de junta directiva o análisis externo avanzado.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="bg-muted/50 rounded-xl p-6 flex items-start gap-4 mt-4 border border-border">
          <HelpCircle className="w-6 h-6 text-primary shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">¿Tienes más preguntas?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Si encuentras algún problema o tienes dudas adicionales que no están cubiertas en esta guía, por favor contacta al administrador del sistema o al equipo técnico de soporte de la Fundación Luker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
