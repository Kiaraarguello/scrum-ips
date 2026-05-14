import api from './api';
import type { Sector } from '../tipos';

export async function listarSectores(): Promise<Sector[]> {
  const { data } = await api.get<Sector[]>('/sectores');
  return data;
}

export async function crearSector(payload: Partial<Sector>): Promise<Sector> {
  const { data } = await api.post<Sector>('/sectores', payload);
  return data;
}

export async function actualizarSector(id: number, payload: Partial<Sector>): Promise<Sector> {
  const { data } = await api.put<Sector>(`/sectores/${id}`, payload);
  return data;
}

export async function eliminarSector(id: number): Promise<void> {
  await api.delete(`/sectores/${id}`);
}
