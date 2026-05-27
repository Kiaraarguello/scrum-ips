import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_desarrollo';
const JWT_EXPIRA_MINUTOS = parseInt(process.env.JWT_EXPIRA_MINUTOS || '480');

export function hashearPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verificarPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function crearToken(datos) {
  return jwt.sign(datos, JWT_SECRET, { expiresIn: JWT_EXPIRA_MINUTOS * 60 });
}