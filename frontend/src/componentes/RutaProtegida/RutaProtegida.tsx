import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../contextos/ContextoAuth';

interface Props {
  children: ReactNode;
  rolesPermitidos?: string[];
}

export default function RutaProtegida({ children, rolesPermitidos }: Props) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <div className="cargando-pantalla">Cargando...</div>;

  if (!usuario) return <Navigate to="/login" replace />;

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/tablero" replace />;
  }

  return <>{children}</>;
}
