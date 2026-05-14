export function formatearFecha(fechaIso: string): string {
  if (!fechaIso) return '';
  // Si no tiene indicador de zona horaria, asumimos UTC (que es lo que manda el backend)
  const iso = (fechaIso.endsWith('Z') || fechaIso.includes('+')) ? fechaIso : `${fechaIso}Z`;
  const fecha = new Date(iso);
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatearFechaHora(fechaIso: string): string {
  if (!fechaIso) return '';
  const iso = (fechaIso.endsWith('Z') || fechaIso.includes('+')) ? fechaIso : `${fechaIso}Z`;
  const fecha = new Date(iso);
  return fecha.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function tiempoRelativo(fechaIso: string): string {
  if (!fechaIso) return '';
  const iso = (fechaIso.endsWith('Z') || fechaIso.includes('+')) ? fechaIso : `${fechaIso}Z`;
  const ahora = Date.now();
  const diferencia = ahora - new Date(iso).getTime();
  const minutos = Math.floor(diferencia / 60_000);
  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} d`;
}
