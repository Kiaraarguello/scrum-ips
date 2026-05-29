import { Router } from 'express';
import { prisma } from '../db.js';
import { verificarPassword, crearToken } from '../seguridad.js';
import { obtenerUsuarioActual } from '../middleware/auth.js';

const router = Router();

function serializarUsuarioToken(u) {
  return {
    id: u.id,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    rol: u.rol,
    sector_id: u.sector_id,
    ver_todos: u.ver_todos,
    seleccion_completada: u.seleccion_completada,
    sectores: (u.sectores || []).map(us => ({ id: us.sector.id, nombre: us.sector.nombre })),
  };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ detail: 'Email y password requeridos' });

    const usuario = await prisma.usuario.findFirst({
      where: { email, activo: true },
      include: { sectores: { include: { sector: true } } },
    });
    if (!usuario || !verificarPassword(password, usuario.password_hash)) {
      return res.status(401).json({ detail: 'Credenciales incorrectas' });
    }

    const token = crearToken({ sub: String(usuario.id), rol: usuario.rol });
    return res.json({ token, usuario: serializarUsuarioToken(usuario) });
  } catch (error) {
    console.error('Error en /api/auth/login:', error);
    return res.status(500).json({
      detail: 'Error interno del servidor al iniciar sesión',
      message: error.message,
      stack: error.stack,
    });
  }
});

// GET /api/auth/yo
router.get('/yo', obtenerUsuarioActual, async (req, res) => {
  const u = req.usuario;
  return res.json({
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
  });
});

// POST /api/auth/impersonate
router.post('/impersonate', obtenerUsuarioActual, async (req, res) => {
  try {
    const uActual = req.usuario;
    // Comprobar que el usuario que lo solicita es super_usuario o super_admin
    if (!['super_admin', 'super_usuario'].includes(uActual.rol)) {
      return res.status(403).json({ detail: 'No tienes permisos para realizar esta acción' });
    }

    const { rol } = req.body;
    if (!['super_usuario', 'super_admin', 'admin', 'usuario'].includes(rol)) {
      return res.status(400).json({ detail: 'Rol inválido para impersonar' });
    }

    // Buscar o crear el usuario incógnito correspondiente en la BD
    const emailIncognito = `incognito_${rol}@scrum-ips.com`;
    let usuarioIncognito = await prisma.usuario.findFirst({
      where: { email: emailIncognito }
    });

    if (!usuarioIncognito) {
      const nombreRolMap = {
        super_usuario: 'Super Usuario',
        super_admin: 'Super Admin',
        admin: 'Admin',
        usuario: 'Usuario'
      };

      // Crear el usuario incógnito
      usuarioIncognito = await prisma.usuario.create({
        data: {
          nombre: 'Incógnito',
          apellido: nombreRolMap[rol],
          email: emailIncognito,
          password_hash: '$2a$10$UnHashedDummyOrBcryptHashPlaceholderToSatisfyRequiredField', // Password dummy ya que no iniciará sesión por vía común
          rol: rol,
          ver_todos: ['super_usuario', 'super_admin', 'admin'].includes(rol),
          seleccion_completada: true,
          activo: true
        }
      });
    }

    // Generar el token JWT de la sesión incógnita
    const token = crearToken({ sub: String(usuarioIncognito.id), rol: usuarioIncognito.rol });

    return res.json({
      token,
      usuario: {
        id: usuarioIncognito.id,
        nombre: usuarioIncognito.nombre,
        apellido: usuarioIncognito.apellido,
        email: usuarioIncognito.email,
        rol: usuarioIncognito.rol,
        sector_id: usuarioIncognito.sector_id,
        ver_todos: usuarioIncognito.ver_todos,
        seleccion_completada: usuarioIncognito.seleccion_completada,
        sectores: []
      }
    });
  } catch (error) {
    console.error('Error en /api/auth/impersonate:', error);
    return res.status(500).json({ detail: 'Error al iniciar modo incógnito' });
  }
});

export default router;