import type { Tarea } from '../tipos';

export type MiembroProyecto = { id: number; nombre: string; apellido: string };

export function esTareaBacklog(tarea: Pick<Tarea, 'proyecto_id'>): boolean {
  return tarea.proyecto_id != null;
}

export function etiquetaIdTarea(tarea: Pick<Tarea, 'id' | 'proyecto_id' | 'numero_backlog'>): string {
  if (tarea.proyecto_id != null && tarea.numero_backlog != null) {
    return `#${tarea.numero_backlog}`;
  }
  return `#${tarea.id}`;
}

export function tituloIdTarea(tarea: Pick<Tarea, 'id' | 'proyecto_id' | 'numero_backlog'>): string {
  if (tarea.proyecto_id != null && tarea.numero_backlog != null) {
    return `Tarea #${tarea.numero_backlog}`;
  }
  return `Tarea #${tarea.id}`;
}
