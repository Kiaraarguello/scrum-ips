import api from './api';

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string | null;
  fecha_creacion: string;
  activo: boolean;
  usuarios?: { id: number; nombre: string; apellido: string }[];
}

export interface ProyectoCrear {
  nombre: string;
  descripcion?: string;
  usuarios_ids?: number[];
}

export async function listarProyectos(): Promise<Proyecto[]> {
  const { data } = await api.get<Proyecto[]>('/proyectos/');
  return data;
}

export async function crearProyecto(proyecto: ProyectoCrear): Promise<Proyecto> {
  const { data } = await api.post<Proyecto>('/proyectos/', proyecto);
  return data;
}

export async function eliminarProyecto(id: number): Promise<void> {
  await api.delete(`/proyectos/${id}`);
}
