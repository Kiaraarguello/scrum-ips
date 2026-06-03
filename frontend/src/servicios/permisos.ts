import api from './api';

export interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface ModuloPermisos {
  titulo: string;
  permisos: Permiso[];
}

export async function obtenerTodosLosPermisos(): Promise<Record<string, ModuloPermisos[]>> {
  const { data } = await api.get<Record<string, ModuloPermisos[]>>('/permisos');
  return data;
}

export async function guardarPermisosRol(rol: string, modulos: ModuloPermisos[]): Promise<void> {
  await api.put(`/permisos/${rol}`, { modulos });
}
