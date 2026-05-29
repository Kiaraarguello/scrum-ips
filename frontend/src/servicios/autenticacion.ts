import api from './api';
import type { Usuario } from '../tipos';

interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

export async function login(email: string, password: string): Promise<RespuestaLogin> {
  const { data } = await api.post<RespuestaLogin>('/auth/login', { email, password });
  return data;
}

export async function obtenerUsuarioActual(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/yo');
  return data;
}

export async function impersonarRol(rol: string): Promise<RespuestaLogin> {
  const { data } = await api.post<RespuestaLogin>('/auth/impersonate', { rol });
  return data;
}
