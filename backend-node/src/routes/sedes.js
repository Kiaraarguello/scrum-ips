import { Router } from 'express';
import { prisma } from '../db.js';
import { obtenerUsuarioActual, requerirAdminOSuperior, requerirPermiso } from '../middleware/auth.js';

const router = Router();

router.get('/', obtenerUsuarioActual, async (req, res) => {
  const sedes = await prisma.sede.findMany();
  return res.json(sedes);
});

router.post('/', requerirPermiso('admin_sectores_sedes'), async (req, res) => {
  const { nombre, ciudad, direccion, notas, activo } = req.body;
  const sede = await prisma.sede.create({ data: { nombre, ciudad, direccion, notas, activo } });
  return res.status(201).json(sede);
});

router.put('/:id', requerirPermiso('admin_sectores_sedes'), async (req, res) => {
  const id = parseInt(req.params.id);
  const sede = await prisma.sede.findUnique({ where: { id } });
  if (!sede) return res.status(404).json({ detail: 'Sede no encontrada' });
  const { nombre, ciudad, direccion, notas, activo } = req.body;
  const data = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (ciudad !== undefined) data.ciudad = ciudad;
  if (direccion !== undefined) data.direccion = direccion;
  if (notas !== undefined) data.notas = notas;
  if (activo !== undefined) data.activo = activo;
  const actualizada = await prisma.sede.update({ where: { id }, data });
  return res.json(actualizada);
});

router.delete('/:id', requerirPermiso('admin_sectores_sedes'), async (req, res) => {
  const id = parseInt(req.params.id);
  const sede = await prisma.sede.findUnique({ where: { id } });
  if (!sede) return res.status(404).json({ detail: 'Sede no encontrada' });
  await prisma.sede.update({ where: { id }, data: { activo: false } });
  return res.status(204).send();
});

export default router;
