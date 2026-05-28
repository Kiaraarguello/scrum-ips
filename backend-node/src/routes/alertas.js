import { Router } from 'express';
import { prisma } from '../db.js';
import { requerirSuperAdminOSuperior } from '../middleware/auth.js';

const router = Router();

// IMPORTANTE: esta ruta debe ir ANTES de /:id/marcar-leida para que Express no la confunda
// PUT /api/alertas/marcar-todas-leidas
router.put('/marcar-todas-leidas', requerirSuperAdminOSuperior, async (req, res) => {
  await prisma.alertaAdmin.updateMany({ where: { leida: false }, data: { leida: true } });
  return res.status(204).send();
});

// GET /api/alertas
router.get('/', requerirSuperAdminOSuperior, async (req, res) => {
  const { solo_no_leidas } = req.query;
  const where = solo_no_leidas === 'true' ? { leida: false } : {};
  const alertas = await prisma.alertaAdmin.findMany({
    where,
    orderBy: { fecha_creacion: 'desc' },
    take: 100,
  });
  return res.json(alertas);
});

// PUT /api/alertas/:id/marcar-leida
router.put('/:id/marcar-leida', requerirSuperAdminOSuperior, async (req, res) => {
  const id = parseInt(req.params.id);
  const alerta = await prisma.alertaAdmin.findUnique({ where: { id } });
  if (!alerta) return res.status(404).json({ detail: 'Alerta no encontrada' });
  const actualizada = await prisma.alertaAdmin.update({ where: { id }, data: { leida: true } });
  return res.json(actualizada);
});

export default router;
