import { Router } from 'express';
import { prisma } from '../db.js';
import { obtenerUsuarioActual, requerirSuperAdminOSuperior } from '../middleware/auth.js';

const router = Router();

const PESO = { alta: 3, media: 2, baja: 1 };

// GET /api/estadisticas/ranking-usuarios
router.get('/ranking-usuarios', requerirSuperAdminOSuperior, async (req, res) => {
  const tareas = await prisma.tarea.findMany({
    where: { estado: 'finalizada', asignados: { some: {} } },
    include: { asignados: true },
  });

  const acumulado = {};

  for (const t of tareas) {
    for (const u of t.asignados) {
      const uid = u.id;
      if (!acumulado[uid]) {
        acumulado[uid] = { usuario_id: uid, nombre: u.nombre || '', apellido: u.apellido || '', puntos: 0, tareas_finalizadas: 0 };
      }
      acumulado[uid].puntos += PESO[t.criticidad] ?? 1;
      acumulado[uid].tareas_finalizadas += 1;
    }
  }

  const ranking = Object.values(acumulado).sort((a, b) => b.puntos - a.puntos);
  return res.json({ ranking });
});

// GET /api/estadisticas/mi-resumen
router.get('/mi-resumen', obtenerUsuarioActual, async (req, res) => {
  const uid = req.usuario.id;
  const corte7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [en_proceso, finalizadas_7_dias, finalizadas_total, ultimas] = await Promise.all([
    prisma.tarea.count({ where: { estado: 'en_proceso', asignados: { some: { id: uid } } } }),
    prisma.tarea.count({ where: { estado: 'finalizada', asignados: { some: { id: uid } }, fecha_finalizacion: { gte: corte7 } } }),
    prisma.tarea.count({ where: { estado: 'finalizada', asignados: { some: { id: uid } } } }),
    prisma.tarea.findMany({
      where: { estado: 'finalizada', asignados: { some: { id: uid } } },
      orderBy: { fecha_finalizacion: 'desc' },
      take: 5,
      select: { id: true, titulo: true, fecha_finalizacion: true },
    }),
  ]);

  return res.json({
    en_proceso,
    finalizadas_7_dias,
    finalizadas_total,
    ultimas_finalizadas: ultimas.map(t => ({ id: t.id, titulo: t.titulo, fecha: String(t.fecha_finalizacion) })),
  });
});

// GET /api/estadisticas/kpis-usuarios
router.get('/kpis-usuarios', requerirSuperAdminOSuperior, async (req, res) => {
  const usuarios = await prisma.usuario.findMany({ where: { activo: true } });
  const resultado = [];

  for (const u of usuarios) {
    const tareas = await prisma.tarea.findMany({ where: { asignados: { some: { id: u.id } } } });
    if (!tareas.length) continue;

    const finalizadas = tareas.filter(t => t.estado === 'finalizada');
    const en_proceso = tareas.filter(t => t.estado === 'en_proceso');
    const por_hacer = tareas.filter(t => t.estado === 'por_hacer');

    const puntos = finalizadas.reduce((acc, t) => acc + (PESO[t.criticidad] ?? 1), 0);

    const alta = tareas.filter(t => t.criticidad === 'alta').length;
    const media = tareas.filter(t => t.criticidad === 'media').length;
    const baja = tareas.filter(t => t.criticidad === 'baja').length;
    const total = tareas.length;
    const pct_alta = total ? Math.round((alta / total) * 1000) / 10 : 0;

    const tiempos_respuesta = tareas
      .filter(t => t.fecha_inicio && t.fecha_creacion && t.fecha_inicio >= t.fecha_creacion)
      .map(t => (t.fecha_inicio - t.fecha_creacion) / 3600000);
    const prom_respuesta = tiempos_respuesta.length
      ? Math.round((tiempos_respuesta.reduce((a, b) => a + b, 0) / tiempos_respuesta.length) * 10) / 10
      : null;

    const tiempos_resolucion = finalizadas
      .filter(t => t.fecha_inicio && t.fecha_finalizacion && t.fecha_finalizacion >= t.fecha_inicio)
      .map(t => (t.fecha_finalizacion - t.fecha_inicio) / 3600000);
    const prom_resolucion = tiempos_resolucion.length
      ? Math.round((tiempos_resolucion.reduce((a, b) => a + b, 0) / tiempos_resolucion.length) * 10) / 10
      : null;

    resultado.push({
      usuario_id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      puntos,
      tareas_finalizadas: finalizadas.length,
      tareas_en_proceso: en_proceso.length,
      tareas_por_hacer: por_hacer.length,
      promedio_respuesta_horas: prom_respuesta,
      promedio_resolucion_horas: prom_resolucion,
      tareas_alta: alta,
      tareas_media: media,
      tareas_baja: baja,
      pct_alta,
    });
  }

  resultado.sort((a, b) => b.puntos - a.puntos);
  return res.json({ usuarios: resultado });
});

export default router;
