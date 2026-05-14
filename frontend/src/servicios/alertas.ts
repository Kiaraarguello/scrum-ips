import api from './api';
import type { AlertaAdmin } from '../tipos';

export async function listarAlertas(soloNoLeidas = false): Promise<AlertaAdmin[]> {
  const { data } = await api.get<AlertaAdmin[]>('/alertas', {
    params: { solo_no_leidas: soloNoLeidas },
  });
  return data;
}

export async function marcarAlertaLeida(id: number): Promise<AlertaAdmin> {
  const { data } = await api.put<AlertaAdmin>(`/alertas/${id}/marcar-leida`);
  return data;
}

export async function marcarTodasLeidas(): Promise<void> {
  await api.put('/alertas/marcar-todas-leidas');
}
