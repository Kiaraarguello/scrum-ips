import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AlertaAdmin } from '../tipos';
import { listarAlertas, marcarAlertaLeida, marcarTodasLeidas } from '../servicios/alertas';
import { useAuth } from './ContextoAuth';

interface ValorContextoNotificaciones {
  alertas: AlertaAdmin[];
  cantidadNoLeidas: number;
  panelAbierto: boolean;
  abrirPanel: () => void;
  cerrarPanel: () => void;
  marcarLeida: (id: number) => Promise<void>;
  marcarTodas: () => Promise<void>;
  recargar: () => void;
}

const ContextoNotificaciones = createContext<ValorContextoNotificaciones | null>(null);

const INTERVALO_POLLING_MS = 15_000;

export function ProveedorNotificaciones({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [alertas, setAlertas] = useState<AlertaAdmin[]>([]);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const recargar = useCallback(() => {
    if (usuario?.rol !== 'admin') return;
    listarAlertas(true).then(setAlertas).catch(() => undefined);
  }, [usuario]);

  useEffect(() => {
    recargar();
    const intervalo = setInterval(recargar, INTERVALO_POLLING_MS);
    return () => clearInterval(intervalo);
  }, [recargar]);

  async function marcarLeida(id: number) {
    await marcarAlertaLeida(id);
    setAlertas((prev) => prev.filter((a) => a.id !== id));
  }

  async function marcarTodas() {
    await marcarTodasLeidas();
    setAlertas([]);
  }

  return (
    <ContextoNotificaciones.Provider
      value={{
        alertas,
        cantidadNoLeidas: alertas.length,
        panelAbierto,
        abrirPanel: () => setPanelAbierto(true),
        cerrarPanel: () => setPanelAbierto(false),
        marcarLeida,
        marcarTodas,
        recargar,
      }}
    >
      {children}
    </ContextoNotificaciones.Provider>
  );
}

export function useNotificaciones() {
  const ctx = useContext(ContextoNotificaciones);
  if (!ctx) throw new Error('useNotificaciones debe usarse dentro de ProveedorNotificaciones');
  return ctx;
}
