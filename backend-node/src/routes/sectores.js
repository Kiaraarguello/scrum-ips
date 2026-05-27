import { Router } from 'express';
import { prisma } from '../db.js';
import { obtenerUsuarioActual, requerirAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', obtenerUsuarioActual, async (req, res) => {
  const sectores = await prisma.sector.findMany({
    where: { activo: true }
  });
  return res.json(sectores);
});

router.post('/', requerirAdmin, async (req, res) => {
  const { nombre, descripcion, activo } = req.body;
  const sector = await prisma.sector.create({ data: { nombre, descripcion, activo } });
  return res.status(201).json(sector);
});

router.put('/:id', requerirAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const sector = await prisma.sector.findUnique({ where: { id } });
  if (!sector) return res.status(404).json({ detail: 'Sector no encontrado' });
  const { nombre, descripcion, activo } = req.body;
  const data = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (descripcion !== undefined) data.descripcion = descripcion;
  if (activo !== undefined) data.activo = activo;
  const actualizado = await prisma.sector.update({ where: { id }, data });
  return res.json(actualizado);
});

router.delete('/:id', requerirAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const sector = await prisma.sector.findUnique({ where: { id } });
  if (!sector) return res.status(404).json({ detail: 'Sector no encontrado' });
  await prisma.sector.update({ where: { id }, data: { activo: false } });
  return res.status(204).send();
});

export default router;