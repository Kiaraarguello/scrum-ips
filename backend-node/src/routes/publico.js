import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

// GET /api/publico/sectores
router.get('/sectores', async (req, res) => {
  const sectores = await prisma.sector.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  });
  return res.json(sectores);
});

// GET /api/publico/sedes
router.get('/sedes', async (req, res) => {
  const sedes = await prisma.sede.findMany({
    where: { activo: true },
    orderBy: { nombre: 'asc' },
  });
  return res.json(sedes);
});

// POST /api/publico/solicitud
router.post('/solicitud', async (req, res) => {
  const { titulo, detalle, criticidad = 'baja', sede_id, nombre_contacto, telefono_contacto } = req.body;

  const admin = await prisma.usuario.findFirst({ where: { rol: 'admin', activo: true } });
  if (!admin) return res.status(503).json({ detail: 'Sistema no disponible' });

  const sector = await prisma.sector.findFirst({ where: { activo: true } });
  if (!sector) return res.status(503).json({ detail: 'Sistema no disponible' });

  const partes = [];
  if (nombre_contacto) partes.push(`Contacto: ${nombre_contacto}`);
  if (detalle) partes.push(detalle);
  const nota = partes.join('\n\n') || null;

  const tarea = await prisma.tarea.create({
    data: {
      titulo,
      nota_llamada: nota,
      criticidad,
      sector_id: sector.id,
      sede_id,
      numero_contacto: telefono_contacto || null,
      creada_por: admin.id,
    },
  });

  await prisma.alertaAdmin.create({
    data: {
      tipo: 'tarea_creada',
      mensaje: `Solicitud pública: '${tarea.titulo}'`,
      tarea_id: tarea.id,
    },
  });

  return res.status(201).json({ ok: true, id: tarea.id });
});

export default router;
