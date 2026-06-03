import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../contextos/ContextoAuth';

interface Props {
  children: ReactNode;
  rolesPermitidos?: string[];
  permisoRequerido?: string;
}

export default function RutaProtegida({ children, rolesPermitidos, permisoRequerido }: Props) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <div className="cargando-pantalla">Cargando...</div>;

  if (!usuario) return <Navigate to="/login" replace />;

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/tablero" replace />;
  }

  if (permisoRequerido) {
    const tienePermiso = usuario.permisos?.[permisoRequerido] === true || usuario.rol === 'super_usuario';
    if (!tienePermiso) {
      return <Navigate to="/tablero" replace />;
    }
  }

  return <>{children}</>;
}
