import api from './api';
import type { Usuario } from '../tipos';

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/usuarios');
  return data;
}

export async function crearUsuario(payload: Partial<Usuario> & { password: string }): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/usuarios', payload);
  return data;
}

export async function actualizarUsuario(id: number, payload: Partial<Usuario> & { password?: string }): Promise<Usuario> {
  const { data } = await api.put<Usuario>(`/usuarios/${id}`, payload);
  return data;
}

export async function eliminarUsuario(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}

export async function actualizarSectorPropio(payload: { sector_ids: number[], ver_todos: boolean }): Promise<Usuario> {
  const { data } = await api.put<Usuario>('/usuarios/yo/sector', payload);
  return data;
}

export async function actualizarSectoresPropio(payload: { sector_ids: number[], ver_todos: boolean }): Promise<Usuario> {
  const { data } = await api.put<Usuario>('/usuarios/yo/sectores', payload);
  return data;
}

export interface PayloadPerfilPropio {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
}

export async function actualizarPerfilPropio(payload: PayloadPerfilPropio): Promise<Usuario> {
  const { data } = await api.put<Usuario>('/usuarios/yo', payload);
  return data;
}
