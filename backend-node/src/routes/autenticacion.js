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

export default router;