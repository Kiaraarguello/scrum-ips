import type { Criticidad } from '../tipos';

const PESOS: Record<Criticidad, number> = { alta: 3, media: 2, baja: 1 };

export function pesoCriticidad(criticidad: Criticidad): number {
  return PESOS[criticidad];
}

export function ordenarPorCriticidad<T extends { criticidad: Criticidad }>(items: T[]): T[] {
  return [...items].sort((a, b) => pesoCriticidad(b.criticidad) - pesoCriticidad(a.criticidad));
}
