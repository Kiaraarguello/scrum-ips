import { Router } from 'express';
import { prisma } from '../db.js';
import { obtenerUsuarioActual, requerirAdminOSuperior } from '../middleware/auth.js';

const router = Router();
const LIMITE_DIAS = 7;
const INCLUDE_TAREA = {
  sector: { select: { id: true, nombre: true } },
  sede: { select: { id: true, nombre: true } },
  creador: { select: { id: true, nombre: true, apellido: true } },
  asignados: { select: { id: true, nombre: true, apellido: true } },
};

async function insertarAlerta(tipo, mensaje, tarea_id, usuario_id) {
  await prisma.alertaAdmin.create({ data: { tipo, mensaje, tarea_id: tarea_id || null, usuario_id: usuario_id || null } });
}

router.get('/', obtenerUsuarioActual, async (req, res) => {
  const { proyecto_id } = req.query;
  const corte = new Date(Date.now() - LIMITE_DIAS * 86400000);
  const where = {
    activo: true,
    OR: [{ estado: { not: 'finalizada' } }, { estado: 'finalizada', fecha_finalizacion: { gte: corte } }],
  };
  if (proyecto_id) { where.proyecto_id = parseInt(proyecto_id); }
  else { where.proyecto_id = null; }

  // Si el usuario no es admin y no tiene habilitada la opción de ver todos los sectores,
  // solo le mostramos los tickets que pertenezcan a sus sectores asignados.
  const perteneceATodosLosSectores = 
    req.usuario.sector?.nombre?.toLowerCase() === 'todos los sectores' ||
    req.usuario.sectores?.some(us => us.sector?.nombre?.toLowerCase() === 'todos los sectores');

  const rolesVistaGlobal = ['admin', 'super_admin', 'super_usuario'];
  if (
    !rolesVistaGlobal.includes(req.usuario.rol) &&
    !req.usuario.ver_todos &&
    !perteneceATodosLosSectores
  ) {
    const sectorIds = req.usuario.sectores.map(us => us.sector_id);
    if (sectorIds.length === 0) return res.json([]);
    where.sector_id = { in: sectorIds };
  }

  const tareas = await prisma.tarea.findMany({ where, include: INCLUDE_TAREA });
  return res.json(tareas);
});

router.get('/:id', obtenerUsuarioActual, async (req, res) => {
  const tarea = await prisma.tarea.findUnique({ where: { id: parseInt(req.params.id) }, include: INCLUDE_TAREA });
  if (!tarea) return res.status(404).json({ detail: 'Tarea no encontrada' });
  return res.json(tarea);
});

router.get('/:id/historial', obtenerUsuarioActual, async (req, res) => {
  const id = parseInt(req.params.id);
  const historial = await prisma.historialTarea.findMany({
    where: { tarea_id: id },
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true } },
    },
    orderBy: { fecha_movimiento: 'desc' },
  });
  return res.json(historial);
});

router.post('/', obtenerUsuarioActual, async (req, res) => {
  const { titulo, nota_llamada, criticidad = 'baja', sector_id, sede_id, numero_contacto, proyecto_id, asignado_ids } = req.body;

  if (!titulo || !String(titulo).trim()) {
    return res.status(400).json({ detail: 'El título es obligatorio' });
  }
  if (!sector_id) {
    return res.status(400).json({ detail: 'El sector es obligatorio' });
  }
  if (!sede_id) {
    return res.status(400).json({ detail: 'La sede es obligatoria' });
  }

  const sectorIdNum = parseInt(sector_id, 10);
  const sedeIdNum = parseInt(sede_id, 10);
  if (Number.isNaN(sectorIdNum) || Number.isNaN(sedeIdNum)) {
    return res.status(400).json({ detail: 'Sector o sede inválidos' });
  }

  const [sector, sede] = await Promise.all([
    prisma.sector.findFirst({ where: { id: sectorIdNum, activo: true } }),
    prisma.sede.findFirst({ where: { id: sedeIdNum, activo: true } }),
  ]);
  if (!sector) return res.status(400).json({ detail: 'Sector inválido o inactivo' });
  if (!sede) return res.status(400).json({ detail: 'Sede inválida o inactiva' });

  const criticidadesValidas = ['alta', 'media', 'baja'];
  if (!criticidadesValidas.includes(criticidad)) {
    return res.status(400).json({ detail: 'Criticidad inválida' });
  }

  const data = { 
    titulo: String(titulo).trim(), 
    nota_llamada: nota_llamada?.trim() || null, 
    criticidad, 
    sector_id: sectorIdNum, 
    sede_id: sedeIdNum, 
    numero_contacto: numero_contacto?.trim() || null, 
    proyecto_id: proyecto_id || null, 
    creada_por: req.usuario.id 
  };
  
  if (asignado_ids && Array.isArray(asignado_ids)) {
    data.asignados = { connect: asignado_ids.map(uid => ({ id: uid })) };
  }

  const tarea = await prisma.tarea.create({
    data,
    include: INCLUDE_TAREA,
  });
  const u = req.usuario;
  await insertarAlerta('tarea_creada', `Nueva tarea '${tarea.titulo}' creada por ${u.nombre} ${u.apellido}`, tarea.id, u.id);
  return res.status(201).json(tarea);
});

router.put('/:id', obtenerUsuarioActual, async (req, res) => {
  const id = parseInt(req.params.id);
  const tarea = await prisma.tarea.findUnique({ where: { id } });
  if (!tarea) return res.status(404).json({ detail: 'Tarea no encontrada' });
  const { titulo, nota_llamada, criticidad, sector_id, sede_id, numero_contacto, asignado_ids } = req.body;
  const data = {};
  if (titulo !== undefined) data.titulo = titulo;
  if (nota_llamada !== undefined) data.nota_llamada = nota_llamada;
  if (criticidad !== undefined) data.criticidad = criticidad;
  if (sector_id !== undefined) data.sector_id = sector_id;
  if (sede_id !== undefined) data.sede_id = sede_id;
  if (numero_contacto !== undefined) data.numero_contacto = numero_contacto;
  if (asignado_ids !== undefined && Array.isArray(asignado_ids)) {
    data.asignados = { set: asignado_ids.map(uid => ({ id: uid })) };
  }
  const actualizada = await prisma.tarea.update({ where: { id }, data, include: INCLUDE_TAREA });
  return res.json(actualizada);
});

router.put('/:id/mover', obtenerUsuarioActual, async (req, res) => {
  const id = parseInt(req.params.id);
  const tarea = await prisma.tarea.findUnique({ where: { id } });
  if (!tarea) return res.status(404).json({ detail: 'Tarea no encontrada' });
  
  const { nuevo_estado, asignado_ids, asignado_a, solucion, pendiente_descripcion } = req.body;

  // Validación defensiva para evitar errores por desincronización de caché en el navegador
  const ESTADOS_VALIDOS = ['por_hacer', 'en_proceso', 'finalizada', 'pendiente'];
  if (nuevo_estado === undefined || !ESTADOS_VALIDOS.includes(String(nuevo_estado))) {
    return res.status(400).json({ 
      detail: `Estado inválido recibido: '${nuevo_estado}'. Por favor, recarga la página (F5) en tu navegador para actualizar la aplicación a la última versión.` 
    });
  }

  const estado_nuevo_str = String(nuevo_estado);
  const estado_anterior = tarea.estado;
  const data = { estado: estado_nuevo_str };
  
  if (estado_nuevo_str === 'en_proceso' && !tarea.fecha_inicio) data.fecha_inicio = new Date();
  if (estado_nuevo_str === 'finalizada') data.fecha_finalizacion = new Date();
  
  if (solucion !== undefined) data.solucion = solucion;
  if (pendiente_descripcion !== undefined) data.pendiente_descripcion = pendiente_descripcion;
  
  // Si vuelve a en proceso, limpiamos la descripción de por qué estaba pendiente
  if (estado_nuevo_str === 'en_proceso') {
    data.pendiente_descripcion = null;
  }
  
  if (asignado_ids !== undefined) {
    data.asignados = { set: asignado_ids.map(uid => ({ id: uid })) };
  } else if (asignado_a !== undefined && asignado_a !== null) {
    data.asignados = { set: [{ id: asignado_a }] };
  }

  const u = req.usuario;
  await prisma.historialTarea.create({ data: { tarea_id: id, usuario_id: u.id, estado_anterior, estado_nuevo: estado_nuevo_str } });
  await insertarAlerta('tarea_movida', `Tarea '${tarea.titulo}' movida de '${estado_anterior}' a '${estado_nuevo_str}' por ${u.nombre} ${u.apellido}`, id, u.id);
  const actualizada = await prisma.tarea.update({ where: { id }, data, include: INCLUDE_TAREA });
  return res.json(actualizada);
});

router.delete('/:id', obtenerUsuarioActual, async (req, res) => {
  const id = parseInt(req.params.id);
  const tarea = await prisma.tarea.findUnique({ where: { id } });
  if (!tarea) return res.status(404).json({ detail: 'Tarea no encontrada' });
  await prisma.tarea.update({ where: { id }, data: { activo: false } });
  return res.status(204).send();
});

export default router;
