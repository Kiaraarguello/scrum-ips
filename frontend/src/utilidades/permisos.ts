import type { Usuario } from '../tipos';

/** Super usuario: acceso total, ignora matriz de permisos en UI. */
export function esSuperUsuario(rol?: string | null): boolean {
  return rol === 'super_usuario';
}

export function tienePermiso(usuario: Usuario | null | undefined, clave: string): boolean {
  if (!usuario) return false;
  if (esSuperUsuario(usuario.rol)) return true;
  return usuario.permisos?.[clave] === true;
}

/** Todos los usuarios autenticados pueden crear tareas desde el tablero. */
export function puedeCrearTarea(usuario: Usuario | null | undefined): boolean {
  return !!usuario;
}

export function puedeAccederAdmin(usuario: Usuario | null | undefined): boolean {
  if (!usuario) return false;
  if (['admin', 'super_admin', 'super_usuario'].includes(usuario.rol)) return true;
  return usuario.permisos?.admin_panel === true;
}

export function rutaPostLogin(usuario: Usuario): string {
  if (puedeAccederAdmin(usuario)) return '/admin';
  if (!usuario.seleccion_completada && !usuario.ver_todos) return '/seleccion-sector';
  return '/tablero';
}
