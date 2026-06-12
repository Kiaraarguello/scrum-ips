import api from './api';
import type { ItemRanking, ResumenPropio, KpisUsuario, RankingEquipo } from '../tipos';

export async function obtenerRankingUsuarios(): Promise<{ ranking: ItemRanking[] }> {
  const { data } = await api.get<{ ranking: ItemRanking[] }>('/estadisticas/ranking-usuarios');
  return data;
}

export async function obtenerRankingEquipo(): Promise<RankingEquipo> {
  const { data } = await api.get<RankingEquipo>('/estadisticas/ranking');
  return data;
}

export async function obtenerResumenPropio(): Promise<ResumenPropio> {
  const { data } = await api.get<ResumenPropio>('/estadisticas/mi-resumen');
  return data;
}

export async function obtenerKpisUsuarios(): Promise<{ usuarios: KpisUsuario[] }> {
  const { data } = await api.get<{ usuarios: KpisUsuario[] }>('/estadisticas/kpis-usuarios');
  return data;
}
