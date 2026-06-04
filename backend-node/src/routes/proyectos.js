import { Router } from 'express';
import { prisma } from '../db.js';
import { obtenerUsuarioActual, requerirAdminOSuperior } from '../middleware/auth.js';

const router = Router();

const INCLUDE_PROYECTO = {
  usuarios: {
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true, rol: true } },
    },
  },
};

function serializarProyecto(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    activo: p.activo,
    fecha_creacion: p.fecha_creacion,
    usuarios: (p.usuarios || []).map(pu => pu.usuario),
  };
}

// GET /api/proyectos/
router.get('/', obtenerUsuarioActual, async (req, res) => {
  const uid = req.usuario.id;
  const esSuperUsuario = req.usuario.rol === 'super_usuario';
  
  const { obtenerPermisosRol } = await import('./permisos.js');
  const perms = await obtenerPermisosRol(req.usuario.rol);
  const tieneVerTodos = perms['backlog_ver_todos'] === true;

  const where = { activo: true };
  if (!esSuperUsuario && !tieneVerTodos) {
    where.usuarios = { some: { usuario_id: uid } };
  }

  const proyectos = await prisma.proyecto.findMany({
    where,
    include: INCLUDE_PROYECTO,
  });
  return res.json(proyectos.map(serializarProyecto));
});


// POST /api/proyectos/
router.post('/', obtenerUsuarioActual, async (req, res) => {
  const { nombre, descripcion, activo = true, usuarios_ids = [] } = req.body;
  const uid = req.usuario.id;
  
  // Si no es super, asegurar que el admin quede incluido en su propio proyecto
  if (!['super_admin', 'super_usuario'].includes(req.usuario.rol) && !usuarios_ids.includes(uid)) {
    usuarios_ids.push(uid);
  }

  const proyecto = await prisma.proyecto.create({
    data: {
      nombre,
      descripcion,
      activo,
      usuarios: {
        create: usuarios_ids.map(id => ({ usuario_id: id })),
      },
    },
    include: INCLUDE_PROYECTO,
  });
  return res.status(201).json(serializarProyecto(proyecto));
});

// GET /api/proyectos/:proyecto_id
router.get('/:proyecto_id', async (req, res) => {
  const id = parseInt(req.params.proyecto_id);
  const proyecto = await prisma.proyecto.findUnique({ where: { id }, include: INCLUDE_PROYECTO });
  if (!proyecto) return res.status(404).json({ detail: 'Proyecto no encontrado' });
  return res.json(serializarProyecto(proyecto));
});

// DELETE /api/proyectos/:proyecto_id
router.delete('/:proyecto_id', obtenerUsuarioActual, async (req, res) => {
  const id = parseInt(req.params.proyecto_id);
  const uid = req.usuario.id;
  const esSuperUsuario = req.usuario.rol === 'super_usuario';

  const proyecto = await prisma.proyecto.findUnique({ 
    where: { id },
    include: { usuarios: true }
  });
  
  if (!proyecto) return res.status(404).json({ detail: 'Proyecto no encontrado' });

  if (!esSuperUsuario) {
    const { obtenerPermisosRol } = await import('./permisos.js');
    const perms = await obtenerPermisosRol(req.usuario.rol);
    
    const esParticipante = proyecto.usuarios.some(u => u.usuario_id === uid);
    const tieneBorrarOtros = perms['backlog_borrar_otros'] === true;
    const tieneBorrarPropios = perms['backlog_borrar_propios'] === true;

    if (!tieneBorrarOtros && !(tieneBorrarPropios && esParticipante)) {
      return res.status(403).json({ detail: 'No tienes permiso para eliminar este backlog' });
    }
  }

  await prisma.proyecto.update({ where: { id }, data: { activo: false } });
  return res.status(204).send();
});

export default router;
