import { Router } from 'express';
import { prisma } from '../db.js';
import { obtenerUsuarioActual, requerirAdminOSuperior, requerirPermiso } from '../middleware/auth.js';
import { hashearPassword } from '../seguridad.js';

const router = Router();

const INCLUDE_USUARIO = {
  sector: true,
  sectores: { include: { sector: true } },
};

function serializarUsuario(u) {
  return {
    id: u.id,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    rol: u.rol,
    sector_id: u.sector_id,
    ver_todos: u.ver_todos,
    seleccion_completada: u.seleccion_completada,
    activo: u.activo,
    fecha_creacion: u.fecha_creacion,
    sector: u.sector ? { id: u.sector.id, nombre: u.sector.nombre } : null,
    sectores: (u.sectores || []).map(us => ({ id: us.sector.id, nombre: us.sector.nombre })),
  };
}

async function resolverSectores(sectorIds) {
  const sectores = await prisma.sector.findMany({ where: { id: { in: sectorIds } } });
  if (sectores.length !== sectorIds.length) {
    const err = new Error('Uno o mas sectores no existen'); err.status = 400; throw err;
  }
  return sectores;
}

// GET /api/usuarios
router.get('/', obtenerUsuarioActual, async (req, res) => {
  const usuarios = await prisma.usuario.findMany({
    where: {
      email: {
        not: {
          startsWith: 'incognito_'
        }
      }
    },
    include: INCLUDE_USUARIO
  });
  return res.json(usuarios.map(serializarUsuario));
});

// POST /api/usuarios
router.post('/', requerirPermiso('admin_usuarios'), async (req, res) => {
  const { nombre, apellido, email, password, rol = 'usuario', sector_ids = [] } = req.body;
  const existe = await prisma.usuario.findFirst({ where: { email } });
  if (existe) return res.status(400).json({ detail: 'El email ya esta registrado' });

  const data = { nombre, apellido, email, password_hash: hashearPassword(password), rol };
  if (rol === 'admin') {
    const todosSectores = await prisma.sector.findFirst({ where: { nombre: 'Todos los sectores' } });
    if (todosSectores) {
      data.sector_id = todosSectores.id;
      data.ver_todos = true;
      data.seleccion_completada = true;
      data.sectores = { create: [{ sector_id: todosSectores.id }] };
    }
  } else if (sector_ids.length > 0) {
    await resolverSectores(sector_ids);
    data.sector_id = sector_ids[0];
    data.seleccion_completada = true;
    data.sectores = { create: sector_ids.map(id => ({ sector_id: id })) };
  }

  const usuario = await prisma.usuario.create({ data, include: INCLUDE_USUARIO });
  return res.status(201).json(serializarUsuario(usuario));
});

// GET /api/usuarios/yo  (debe ir ANTES de /:id)
router.get('/yo', obtenerUsuarioActual, async (req, res) => {
  const u = await prisma.usuario.findUnique({ where: { id: req.usuario.id }, include: INCLUDE_USUARIO });
  return res.json(serializarUsuario(u));
});

// PUT /api/usuarios/yo
router.put('/yo', obtenerUsuarioActual, async (req, res) => {
  const { nombre, apellido, email, password } = req.body;
  const u = req.usuario;
  if (email && email !== u.email) {
    const existe = await prisma.usuario.findFirst({ where: { email } });
    if (existe) return res.status(400).json({ detail: 'El email ya esta en uso' });
  }
  const data = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (apellido !== undefined) data.apellido = apellido;
  if (email !== undefined) data.email = email;
  if (password !== undefined) data.password_hash = hashearPassword(password);
  const actualizado = await prisma.usuario.update({ where: { id: u.id }, data, include: INCLUDE_USUARIO });
  return res.json(serializarUsuario(actualizado));
});

// PUT /api/usuarios/yo/sectores
router.put('/yo/sectores', obtenerUsuarioActual, async (req, res) => {
  const { sector_ids = [], ver_todos = false } = req.body;
  const u = req.usuario;
  if (sector_ids.length > 0) await resolverSectores(sector_ids);
  let nuevoSectorId = u.sector_id;
  if (!ver_todos && u.sector_id && !sector_ids.includes(u.sector_id)) {
    nuevoSectorId = sector_ids.length > 0 ? sector_ids[0] : null;
  }
  await prisma.usuarioSector.deleteMany({ where: { usuario_id: u.id } });
  const actualizado = await prisma.usuario.update({
    where: { id: u.id },
    data: { ver_todos, sector_id: nuevoSectorId, sectores: { create: sector_ids.map(id => ({ sector_id: id })) } },
    include: INCLUDE_USUARIO,
  });
  return res.json(serializarUsuario(actualizado));
});

// PUT /api/usuarios/yo/sector
router.put('/yo/sector', obtenerUsuarioActual, async (req, res) => {
  const { sector_ids = [], ver_todos = false } = req.body;
  const u = req.usuario;
  if (sector_ids.length > 0) await resolverSectores(sector_ids);
  await prisma.usuarioSector.deleteMany({ where: { usuario_id: u.id } });
  const actualizado = await prisma.usuario.update({
    where: { id: u.id },
    data: {
      ver_todos, seleccion_completada: true,
      sector_id: sector_ids.length > 0 ? sector_ids[0] : null,
      sectores: { create: sector_ids.map(id => ({ sector_id: id })) },
    },
    include: INCLUDE_USUARIO,
  });
  return res.json(serializarUsuario(actualizado));
});

// PUT /api/usuarios/:id
router.put('/:id', requerirPermiso('admin_usuarios'), async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) return res.status(404).json({ detail: 'Usuario no encontrado' });

  const { nombre, apellido, email, password, rol, sector_id, sector_ids, ver_todos, seleccion_completada, activo } = req.body;
  const data = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (apellido !== undefined) data.apellido = apellido;
  if (email !== undefined) data.email = email;
  if (password !== undefined) data.password_hash = hashearPassword(password);
  if (rol !== undefined) data.rol = rol;
  if (sector_id !== undefined) data.sector_id = sector_id;
  if (ver_todos !== undefined) data.ver_todos = ver_todos;
  if (seleccion_completada !== undefined) data.seleccion_completada = seleccion_completada;
  if (activo !== undefined) data.activo = activo;

  const nuevoRol = rol !== undefined ? rol : usuario.rol;
  if (nuevoRol === 'admin') {
    const todosSectores = await prisma.sector.findFirst({ where: { nombre: 'Todos los sectores' } });
    if (todosSectores) {
      data.sector_id = todosSectores.id;
      data.ver_todos = true;
      data.seleccion_completada = true;
      await prisma.usuarioSector.deleteMany({ where: { usuario_id: id } });
      data.sectores = { create: [{ sector_id: todosSectores.id }] };
    }
  } else if (sector_ids !== undefined) {
    if (sector_ids.length > 0) await resolverSectores(sector_ids);
    await prisma.usuarioSector.deleteMany({ where: { usuario_id: id } });
    data.sectores = { create: sector_ids.map(sid => ({ sector_id: sid })) };
    const sectorActualId = data.sector_id ?? usuario.sector_id;
    if (!sector_ids.includes(sectorActualId)) {
      data.sector_id = sector_ids.length > 0 ? sector_ids[0] : null;
    }
  }

  if (nuevoRol !== 'admin' && ((sector_ids && sector_ids.length > 0) || ver_todos)) {
    data.seleccion_completada = true;
  }

  const actualizado = await prisma.usuario.update({ where: { id }, data, include: INCLUDE_USUARIO });
  return res.json(serializarUsuario(actualizado));
});

// DELETE /api/usuarios/:id
router.delete('/:id', requerirPermiso('admin_usuarios'), async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) return res.status(404).json({ detail: 'Usuario no encontrado' });
  await prisma.usuario.update({ where: { id }, data: { activo: false } });
  return res.status(204).send();
});

export default router;
