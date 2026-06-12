import {
  closestCorners,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import type { EstadoTarea, Tarea } from '../tipos';

export const COLUMNAS_TABLERO: EstadoTarea[] = ['por_hacer', 'en_proceso', 'finalizada'];

const ESTADOS_COLUMNAS = new Set<string>(COLUMNAS_TABLERO);

export function resolverColumnaDestino(
  overId: UniqueIdentifier | undefined,
  tareas: Tarea[]
): EstadoTarea | null {
  if (overId == null) return null;
  const idStr = String(overId);
  if (ESTADOS_COLUMNAS.has(idStr)) return idStr as EstadoTarea;
  const id = Number(overId);
  if (!Number.isNaN(id)) {
    const tarea = tareas.find((t) => t.id === id);
    if (tarea && ESTADOS_COLUMNAS.has(tarea.estado)) return tarea.estado;
  }
  return null;
}

/** Prioriza la columna bajo el cursor; acepta soltar sobre tarjetas o zona vacía */
export const deteccionColisionTablero: CollisionDetection = (args) => {
  const puntero = pointerWithin(args);
  const base = puntero.length > 0 ? puntero : rectIntersection(args);
  if (base.length === 0) return closestCorners(args);

  const columnas = base.filter((c) => ESTADOS_COLUMNAS.has(String(c.id)));
  if (columnas.length > 0) return columnas;

  return base;
};
