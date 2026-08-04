
import { UseFormReturn } from "react-hook-form";
import { BasicProgramFields } from "./BasicProgramFields";
import { ProgramSelectionFields } from "./ProgramSelectionFields";
import { SeguimientoFinanciero } from "./SeguimientoFinanciero";
import { SeguimientoTecnico } from "./SeguimientoTecnico";

interface ProgramFormFieldsProps {
  form: UseFormReturn<any>;
}

export function ProgramFormFields({ form }: ProgramFormFieldsProps) {
  console.log("ProgramFormFields - Rendering with form data:", form.getValues());
  
  return (
    <div className="space-y-5">
      <section className="space-y-3 border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">Información Básica</h3>
        <BasicProgramFields form={form} />
      </section>
      
      <section className="space-y-3 border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground">Eje Estratégico y Configuración</h3>
        <ProgramSelectionFields form={form} />
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
