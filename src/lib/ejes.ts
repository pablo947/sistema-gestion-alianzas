// Catálogo único de Ejes Estratégicos.
// Es la fuente de verdad del frontend para nombres, orden, colores y helpers de herencia.

export const EJES = [
  "Primera infancia",
  "Educación en el aula",
  "Jóvenes y dinámicas más allá del aula",
  "Vida productiva",
  "Legado misional",
  "Legado no misional",
  "Conocimiento e incidencia",
] as const;

export type Eje = typeof EJES[number];

// Colores por eje (clases Tailwind sobre tokens semánticos).
export const EJE_BADGE_CLASS: Record<string, string> = {
  "Primera infancia": "bg-pink-500/10 text-pink-700 border-pink-200",
  "Educación en el aula": "bg-blue-500/10 text-blue-700 border-blue-200",
  "Jóvenes y dinámicas más allá del aula": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  "Vida productiva": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  "Legado misional": "bg-purple-500/10 text-purple-700 border-purple-200",
  "Legado no misional": "bg-violet-500/10 text-violet-700 border-violet-200",
  "Conocimiento e incidencia": "bg-cyan-500/10 text-cyan-700 border-cyan-200",
};

// Normaliza variantes históricas (capitalización antigua) al nombre oficial.
const EJE_ALIASES: Record<string, Eje> = {
  "primera infancia": "Primera infancia",
  "educación en el aula": "Educación en el aula",
  "educacion en el aula": "Educación en el aula",
  "jóvenes y dinámicas más allá del aula": "Jóvenes y dinámicas más allá del aula",
  "jovenes y dinamicas mas alla del aula": "Jóvenes y dinámicas más allá del aula",
  "vida productiva": "Vida productiva",
  "legado misional": "Legado misional",
  "legado no misional": "Legado no misional",
  "conocimiento e incidencia": "Conocimiento e incidencia",
  "organizaciones e iniciativas del legado": "Legado misional", // Fallback for old data
};

export function normalizeEje(value?: string | null): Eje | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return EJE_ALIASES[key] ?? (EJES.includes(value as Eje) ? (value as Eje) : null);
}

// Extrae los ejes únicos de los proyectos asociados a un actor.
// Espera la forma { actor_programs: [{ programs: { eje_estrategico } }] } o { programs: [...] }.
export function getEjesFromActor(actor: any): Eje[] {
  if (!actor) return [];
  const programs: any[] = actor.actor_programs?.map((ap: any) => ap.programs).filter(Boolean)
    || actor.programs
    || [];
  const set = new Set<Eje>();
  programs.forEach((p) => {
    const eje = normalizeEje(p?.eje_estrategico);
    if (eje) set.add(eje);
  });
  return Array.from(set);
}

// Extrae los proyectos (nombres) de un actor.
export function getProjectsFromActor(actor: any): string[] {
  if (!actor) return [];
  const programs: any[] = actor.actor_programs?.map((ap: any) => ap.programs).filter(Boolean)
    || actor.programs
    || [];
  return programs.map((p) => p?.nombre).filter(Boolean);
}
