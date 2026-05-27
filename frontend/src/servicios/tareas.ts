import api from './api';
import type { Tarea } from '../tipos';

export async function listarTareas(proyectoId?: number): Promise<Tarea[]> {
  const url = proyectoId ? `/tareas?proyecto_id=${proyectoId}` : '/tareas';
  const { data } = await api.get<Tarea[]>(url);
  return data;
}

export async function obtenerTarea(id: number): Promise<Tarea> {
  const { data } = await api.get<Tarea>(`/tareas/${id}`);
  return data;
}

export async function crearTarea(payload: Partial<Tarea>): Promise<Tarea> {
  const { data } = await api.post<Tarea>('/tareas', payload);
  return data;
}

export async function actualizarTarea(id: number, payload: Partial<Tarea>): Promise<Tarea> {
  const { data } = await api.put<Tarea>(`/tareas/${id}`, payload);
  return data;
}

export async function moverTarea(
  id: number, 
  nuevo_estado: string, 
  usuarioIds?: number[],
  solucion?: string,
  pendiente_descripcion?: string
): Promise<Tarea> {
  const { data } = await api.put<Tarea>(`/tareas/${id}/mover`, { 
    nuevo_estado, 
    asignado_ids: usuarioIds,
    solucion,
    pendiente_descripcion
  });
  return data;
}

export async function eliminarTarea(id: number): Promise<void> {
  await api.delete(`/tareas/${id}`);
}
