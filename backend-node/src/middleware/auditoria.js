import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_desarrollo';

function obtenerRutaApi(req) {
  const combinada = `${req.baseUrl || ''}${req.path || ''}`;
  if (combinada.startsWith('/api')) return combinada;
  const original = (req.originalUrl || '').split('?')[0];
  return original.startsWith('/api') ? original : combinada;
}

// Helper para sanitizar el cuerpo de la petición (redactar contraseñas)
function sanitizarCuerpo(body) {
  if (!body) return null;
  
  // Clonar para evitar mutar el req.body original
  const copia = JSON.parse(JSON.stringify(body));
  
  const camposSensibles = [
    'password', 
    'contraseña', 
    'contrasena', 
    'password_hash', 
    'token', 
    'newPassword', 
    'confirmPassword',
    'passwordAnterior'
  ];
  
  const rediseñarObjeto = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    for (const clave in obj) {
      if (camposSensibles.some(campo => clave.toLowerCase().includes(campo.toLowerCase()))) {
        obj[clave] = '[REDACTADO]';
      } else if (typeof obj[clave] === 'object') {
        rediseñarObjeto(obj[clave]);
      }
    }
  };

  rediseñarObjeto(copia);
  return copia;
}

export function middlewareAuditoria(req, res, next) {
  const path = obtenerRutaApi(req);

  if (!path.startsWith('/api')) {
    return next();
  }

  const { method, ip, body, query } = req;

  const esMutacion = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const esLogin = path === '/api/auth/login' && method === 'POST';

  if (!esMutacion && !esLogin) {
    return next();
  }

  res.on('finish', async () => {
    try {
      const esLoginEvento = path === '/api/auth/login' && method === 'POST';
      if (!esLoginEvento && res.statusCode >= 400) {
        return;
      }

      let usuarioId = null;
      let email = null;

      if (req.usuario) {
        usuarioId = req.usuario.id;
        email = req.usuario.email;
      } else if (req.payload && req.payload.sub) {
        usuarioId = parseInt(req.payload.sub);
      }

      if (!usuarioId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.slice(7);
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded && decoded.sub) {
              usuarioId = parseInt(decoded.sub);
            }
          } catch {
            // token inválido
          }
        }
      }

      if (usuarioId && !email) {
        const u = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { email: true, nombre: true, apellido: true },
        });
        if (u) {
          email = u.email;
        }
      }

      if (esLoginEvento) {
        if (body && body.email) {
          email = body.email;
        }
        if (res.statusCode === 200 && body && body.email) {
          const u = await prisma.usuario.findFirst({
            where: { email: body.email },
            select: { id: true },
          });
          if (u) {
            usuarioId = u.id;
          }
        }
      }

      let accion = `${method} ${path}`;
      let modeloPrisma = null;

      if (path.startsWith('/api/auth/login')) {
        modeloPrisma = prisma.auditoriaSesion;
        accion = res.statusCode === 200 ? 'Inicio de sesión exitoso' : 'Intento de inicio de sesión fallido';
      } else if (path.startsWith('/api/auth/impersonate')) {
        modeloPrisma = prisma.auditoriaSesion;
        accion = 'Inicio de sesión incógnito';
      } else if (path.startsWith('/api/permisos')) {
        modeloPrisma = prisma.auditoriaUsuario;
        if (method === 'PUT') accion = 'Modificación de permisos de rol';
      } else if (path.startsWith('/api/usuarios')) {
        modeloPrisma = prisma.auditoriaUsuario;
        if (method === 'POST') accion = 'Creación de usuario';
        else if (method === 'PUT') {
          if (path.endsWith('/yo')) accion = 'Modificación de perfil propio';
          else if (path.endsWith('/sectores') || path.endsWith('/sector')) accion = 'Actualización de sectores asignados';
          else accion = 'Modificación de usuario';
        }
        else if (method === 'DELETE') accion = 'Desactivación de usuario';
      } else if (path.startsWith('/api/sectores')) {
        modeloPrisma = prisma.auditoriaSector;
        if (method === 'POST') accion = 'Creación de sector';
        else if (method === 'PUT') accion = 'Modificación de sector';
        else if (method === 'DELETE') accion = 'Eliminación (desactivación) de sector';
      } else if (path.startsWith('/api/sedes')) {
        modeloPrisma = prisma.auditoriaSede;
        if (method === 'POST') accion = 'Creación de sede';
        else if (method === 'PUT') accion = 'Modificación de sede';
        else if (method === 'DELETE') accion = 'Eliminación (desactivación) de sede';
      } else if (path.startsWith('/api/tareas')) {
        modeloPrisma = prisma.auditoriaTarea;
        if (method === 'POST') accion = 'Creación de tarea';
        else if (method === 'PUT') {
          if (path.endsWith('/mover')) accion = 'Movimiento de estado de tarea';
          else accion = 'Modificación de tarea';
        }
        else if (method === 'DELETE') accion = 'Eliminación (desactivación) de tarea';
      } else if (path.startsWith('/api/pcs')) {
        modeloPrisma = prisma.auditoriaPc;
        if (method === 'POST') accion = 'Creación de registro de PC';
        else if (method === 'PUT') accion = 'Modificación de registro de PC';
        else if (method === 'DELETE') accion = 'Eliminación de registro de PC';
      } else if (path.startsWith('/api/proyectos')) {
        modeloPrisma = prisma.auditoriaProyecto;
        if (method === 'POST') accion = 'Creación de proyecto';
        else if (method === 'PUT') accion = 'Modificación de proyecto';
        else if (method === 'DELETE') accion = 'Eliminación de proyecto';
      }

      if (!modeloPrisma) {
        return;
      }

      const detalles = {
        ruta: path,
        metodo: method,
        body: sanitizarCuerpo(body),
        query: Object.keys(query).length > 0 ? query : undefined,
        params: req.params && Object.keys(req.params).length > 0 ? req.params : undefined,
      };

      await modeloPrisma.create({
        data: {
          usuario_id: usuarioId,
          email: email || 'Anónimo / No identificado',
          accion,
          detalles: JSON.stringify(detalles),
          ip: ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          estado_codigo: res.statusCode,
        },
      });
    } catch (error) {
      console.error('Error al registrar auditoría modular:', error.message);
    }
  });

  next();
}
