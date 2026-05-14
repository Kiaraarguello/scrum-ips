import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuario } from '../tipos';
import { obtenerUsuarioActual } from '../servicios/autenticacion';

interface ValorContextoAuth {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  iniciarSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
}

const ContextoAuth = createContext<ValorContextoAuth | null>(null);

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (token) {
      obtenerUsuarioActual()
        .then(setUsuario)
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, [token]);

  function iniciarSesion(nuevoToken: string, nuevoUsuario: Usuario) {
    localStorage.setItem('token', nuevoToken);
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }

  function cerrarSesion() {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  }

  function actualizarUsuario(nuevoUsuario: Usuario) {
    setUsuario(nuevoUsuario);
  }

  return (
    <ContextoAuth.Provider value={{ usuario, token, cargando, iniciarSesion, cerrarSesion, actualizarUsuario }}>
      {children}
    </ContextoAuth.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(ContextoAuth);
  if (!ctx) throw new Error('useAuth debe usarse dentro de ProveedorAuth');
  return ctx;
}
