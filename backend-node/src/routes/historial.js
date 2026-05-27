import { Router } from 'express';
import { prisma } from '../db.js';
import { requerirAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/historial
router.get('/', requerirAdmin, async (req, res) => {
  const { usuario_id, tarea_id, desde, hasta } = req.query;

  const where = {};
  if (usuario_id) where.usuario_id = parseInt(usuario_id);
  if (tarea_id) where.tarea_id = parseInt(tarea_id);
  if (desde) where.fecha_movimiento = { ...where.fecha_movimiento, gte: new Date(desde) };
  if (hasta) where.fecha_movimiento = { ...where.fecha_movimiento, lte: new Date(hasta) };

  const historial = await prisma.historialTarea.findMany({
    where,
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true } },
      tarea: { select: { id: true, titulo: true } },
    },
    orderBy: { fecha_movimiento: 'desc' },
  });
  return res.json(historial);
});

export default router;
