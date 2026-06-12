/** Orden alfabético en español (ignora mayúsculas y acentos). */
export function ordenarPorNombre<T extends { nombre: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
  );
}
