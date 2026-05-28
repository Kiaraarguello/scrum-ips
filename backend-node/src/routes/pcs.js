import { Router } from 'express';
import { prisma } from '../db.js';
import { obtenerUsuarioActual, requerirAdminOSuperior } from '../middleware/auth.js';

const router = Router();

const INCLUDE_PC = { sede: { select: { id: true, nombre: true } } };

// GET /api/pcs
router.get('/', obtenerUsuarioActual, async (req, res) => {
  const pcs = await prisma.pcRegistro.findMany({
    include: INCLUDE_PC,
    orderBy: { fecha_ingreso: 'desc' },
  });
  return res.json(pcs);
});

// POST /api/pcs
router.post('/', obtenerUsuarioActual, async (req, res) => {
  const { nombre_interno, descripcion, ciudad, sede_id, propietario, notas } = req.body;
  const pc = await prisma.pcRegistro.create({
    data: { nombre_interno, descripcion, ciudad, sede_id: sede_id || null, propietario, notas },
    include: INCLUDE_PC,
  });

  const u = req.usuario;
  await prisma.alertaAdmin.create({
    data: {
      tipo: 'pc_ingresada',
      mensaje: `PC '${pc.nombre_interno}' ingresada al taller por ${u.nombre} ${u.apellido}`,
      pc_id: pc.id,
      usuario_id: u.id,
    },
  });

  return res.status(201).json(pc);
});

// PUT /api/pcs/:id
router.put('/:id', obtenerUsuarioActual, async (req, res) => {
  const id = parseInt(req.params.id);
  const pc = await prisma.pcRegistro.findUnique({ where: { id } });
  if (!pc) return res.status(404).json({ detail: 'PC no encontrada' });

  const { nombre_interno, descripcion, ciudad, sede_id, propietario, fecha_salida, estado, notas } = req.body;
  const data = {};
  if (nombre_interno !== undefined) data.nombre_interno = nombre_interno;
  if (descripcion !== undefined) data.descripcion = descripcion;
  if (ciudad !== undefined) data.ciudad = ciudad;
  if (sede_id !== undefined) data.sede_id = sede_id;
  if (propietario !== undefined) data.propietario = propietario;
  if (fecha_salida !== undefined) data.fecha_salida = fecha_salida ? new Date(fecha_salida) : null;
  if (estado !== undefined) data.estado = estado;
  if (notas !== undefined) data.notas = notas;

  const actualizada = await prisma.pcRegistro.update({ where: { id }, data, include: INCLUDE_PC });
  return res.json(actualizada);
});

// DELETE /api/pcs/:id
router.delete('/:id', requerirAdminOSuperior, async (req, res) => {
  const id = parseInt(req.params.id);
  const pc = await prisma.pcRegistro.findUnique({ where: { id } });
  if (!pc) return res.status(404).json({ detail: 'PC no encontrada' });
  await prisma.pcRegistro.delete({ where: { id } });
  return res.status(204).send();
});

export default router;
