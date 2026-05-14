import api from './api';
import type { PcRegistro } from '../tipos';

export async function listarPcs(): Promise<PcRegistro[]> {
  const { data } = await api.get<PcRegistro[]>('/pcs');
  return data;
}

export async function crearPc(payload: Partial<PcRegistro>): Promise<PcRegistro> {
  const { data } = await api.post<PcRegistro>('/pcs', payload);
  return data;
}

export async function actualizarPc(id: number, payload: Partial<PcRegistro>): Promise<PcRegistro> {
  const { data } = await api.put<PcRegistro>(`/pcs/${id}`, payload);
  return data;
}

export async function eliminarPc(id: number): Promise<void> {
  await api.delete(`/pcs/${id}`);
}
