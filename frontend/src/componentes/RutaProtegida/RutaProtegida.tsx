import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../contextos/ContextoAuth';

interface Props {
  children: ReactNode;
  soloAdmin?: boolean;
}

export default function RutaProtegida({ children, soloAdmin = false }: Props) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <div className="cargando-pantalla">Cargando...</div>;

  if (!usuario) return <Navigate to="/login" replace />;

  if (soloAdmin && usuario.rol !== 'admin') return <Navigate to="/tablero" replace />;

  return <>{children}</>;
}
