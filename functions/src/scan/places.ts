/** Geography from SPEC §5. Names are stored normalized (see normalize()). */
export const CESAR_MUNICIPALITIES = [
  "Curumaní", "Chimichagua", "Tamalameque", "Pailitas", "Pelaya", "Chiriguaná", "La Jagua de Ibirico",
  "Agustín Codazzi", "Valledupar", "Aguachica", "Gamarra", "El Paso", "Bosconia", "Becerril", "San Diego",
  "La Paz", "Astrea", "Pueblo Bello", "San Martín", "San Alberto", "La Gloria", "Río de Oro", "Manaure", "El Copey",
];

/** Second circle: south of La Guajira, El Banco (Magdalena) and south of Bolívar. */
export const SECOND_CIRCLE = [
  "San Juan del Cesar", "Fonseca", "Villanueva", "Urumita", "El Molino", "Barrancas", "Distracción", "La Jagua del Pilar",
  "El Banco", "Mompox", "Mompós", "Magangué", "Simití", "Morales", "Santa Rosa del Sur", "San Pablo",
];

export const CARIBBEAN_DEPARTMENTS = ["Cesar", "La Guajira", "Magdalena", "Bolívar", "Atlántico", "Sucre", "Córdoba"];

/** Lowercase, no accents, only letters/digits and single spaces. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const setOf = (names: string[]) => new Set(names.map(normalize));
export const CESAR = setOf(CESAR_MUNICIPALITIES);
export const SECOND = setOf(SECOND_CIRCLE);
export const CARIBBEAN = setOf(CARIBBEAN_DEPARTMENTS);
