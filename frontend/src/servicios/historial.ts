import api from './api';
import type { HistorialMovimiento } from '../tipos';

interface FiltrosHistorial {
  usuario_id?: number;
  tarea_id?: number;
  desde?: string;
  hasta?: string;
}

export async function listarHistorial(filtros: FiltrosHistorial = {}): Promise<HistorialMovimiento[]> {
  const { data } = await api.get<HistorialMovimiento[]>('/historial', { params: filtros });
  return data;
}
