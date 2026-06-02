## Objetivo
Agregar "Responsable de Comunicaciones" como nueva opción dentro de **Nivel de dirección** y asegurar que aparezca en el filtro avanzado de contactos.

## Cambios

### 1. Base de datos (migración)
- Agregar el valor `'Responsable de Comunicaciones'` al enum `public.nivel_direccion`.
  ```sql
  ALTER TYPE public.nivel_direccion ADD VALUE IF NOT EXISTS 'Responsable de Comunicaciones';
  ```
- Actualizar la función `sugerir_nivel_direccion` para detectar cargos relacionados con comunicaciones (palabras clave: `comunicacion`, `comunicaciones`, `prensa`, `relaciones publicas`, `community manager`, `social media`, `marketing y comunicaciones`) y retornar el nuevo nivel antes de las demás reglas.

### 2. Frontend — constantes
- `src/components/contacts/types.ts`: añadir `'Responsable de Comunicaciones'` al array `NIVELES_DIRECCION` (al final, antes de `'Sin clasificar'`).
  - Esto lo hace aparecer automáticamente en:
    - El selector del formulario de contactos (`ContactFormFields.tsx`).
    - El filtro avanzado de contactos (`ContactsAdvancedFilters.tsx`) ya que itera sobre `NIVELES_DIRECCION`.

### 3. Verificación
- Confirmar que `ContactFormFields` y `ContactsAdvancedFilters` muestran la nueva opción.
- Confirmar que un contacto con cargo "Jefe de Comunicaciones" recibe sugerencia automática del nuevo nivel.

## Notas técnicas
- El enum requiere que `ADD VALUE` se ejecute fuera de un bloque transaccional con otras operaciones que lo usen; la migración solo añade el valor y reemplaza la función, sin insertar datos que lo referencien en el mismo statement.
- No se requieren cambios en RLS ni en hooks de reportes; `useFilteredContactsReport` ya filtra por `nivel_direccion` usando los valores enviados desde la UI.
