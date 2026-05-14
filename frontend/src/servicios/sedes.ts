import api from './api';
import type { Sede } from '../tipos';

export async function listarSedes(): Promise<Sede[]> {
  const { data } = await api.get<Sede[]>('/sedes');
  return data;
}

export async function crearSede(payload: Partial<Sede>): Promise<Sede> {
  const { data } = await api.post<Sede>('/sedes', payload);
  return data;
}

export async function actualizarSede(id: number, payload: Partial<Sede>): Promise<Sede> {
  const { data } = await api.put<Sede>(`/sedes/${id}`, payload);
  return data;
}

export async function eliminarSede(id: number): Promise<void> {
  await api.delete(`/sedes/${id}`);
}
