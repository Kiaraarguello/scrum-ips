import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_desarrollo';

export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Token requerido' });
  }
  const token = authHeader.slice(7);
  try {
    req.payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ detail: 'Token invalido' });
  }
  next();
}

export async function obtenerUsuarioActual(req, res, next) {
  verificarToken(req, res, async () => {
    const usuario = await prisma.usuario.findFirst({
      where: { id: parseInt(req.payload.sub), activo: true },
      include: {
        sector: true,
        sectores: { include: { sector: true } },
      },
    });
    if (!usuario) return res.status(401).json({ detail: 'Usuario no encontrado' });
    req.usuario = usuario;
    next();
  });
}

export async function requerirAdmin(req, res, next) {
  await obtenerUsuarioActual(req, res, () => {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ detail: 'Se requiere rol admin' });
    }
    next();
  });
}