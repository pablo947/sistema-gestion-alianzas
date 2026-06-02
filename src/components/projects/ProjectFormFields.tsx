
import { UseFormReturn } from "react-hook-form";
import { BasicProjectFields } from "./BasicProjectFields";
import { ProjectSelectionFields } from "./ProjectSelectionFields";
import { SeguimientoFinanciero } from "./SeguimientoFinanciero";
import { SeguimientoTecnico } from "./SeguimientoTecnico";

interface ProjectFormFieldsProps {
  form: UseFormReturn<any>;
}

export function ProjectFormFields({ form }: ProjectFormFieldsProps) {
  console.log("ProjectFormFields - Rendering with form data:", form.getValues());
  
  return (
    <div className="space-y-5">
      <section className="space-y-3 border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">Información Básica</h3>
        <BasicProjectFields form={form} />
      </section>
      
      <section className="space-y-3 border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">Eje Estratégico y Configuración</h3>
        <ProjectSelectionFields form={form} />
      </section>
      
      <section className="border-b border-border pb-4">
        <SeguimientoFinanciero form={form} />
      </section>
      
      <section>
        <SeguimientoTecnico form={form} />
      </section>
    </div>
  );
}
