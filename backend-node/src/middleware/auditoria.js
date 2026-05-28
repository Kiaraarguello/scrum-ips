import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_desarrollo';

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
  // Solo auditamos llamadas a la API (rutas que empiezan con /api)
  if (!req.path.startsWith('/api')) {
    return next();
  }

  const { method, path, ip, body, query } = req;

  // Auditamos mutaciones (POST, PUT, DELETE, PATCH) e inicios de sesión
  const esMutacion = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const esLogin = path === '/api/auth/login' && method === 'POST';

  if (!esMutacion && !esLogin) {
    return next();
  }

  // Interceptamos la finalización de la petición de forma asíncrona
  res.on('finish', async () => {
    try {
      let usuarioId = null;
      let email = null;

      // 1. Obtener usuario del objeto request si ya está autenticado
      if (req.usuario) {
        usuarioId = req.usuario.id;
        email = req.usuario.email;
      } else if (req.payload && req.payload.sub) {
        usuarioId = parseInt(req.payload.sub);
      }

      // 2. Si no hay usuario y hay header de autorización, intentar decodificar el token JWT manualmente
      if (!usuarioId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.slice(7);
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded && decoded.sub) {
              usuarioId = parseInt(decoded.sub);
            }
          } catch (err) {
            // Ignorar errores de verificación de token
          }
        }
      }

      // 3. Buscar el email en la BD si tenemos el id de usuario pero no el email
      if (usuarioId && !email) {
        const u = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { email: true }
        });
        if (u) {
          email = u.email;
        }
      }

      // 4. Caso especial: Inicio de sesión
      if (esLogin) {
        if (body && body.email) {
          email = body.email;
        }
        // Si el login fue exitoso (200), buscar el ID del usuario
        if (res.statusCode === 200 && body && body.email) {
          const u = await prisma.usuario.findFirst({
            where: { email: body.email },
            select: { id: true }
          });
          if (u) {
            usuarioId = u.id;
          }
        }
      }

      // Determinar la acción amigable y la tabla de auditoría correspondiente
      let accion = `${method} ${path}`;
      let modeloPrisma = null;

      // Modularización según el endpoint
      if (path.startsWith('/api/auth/login')) {
        modeloPrisma = prisma.auditoriaSesion;
        accion = res.statusCode === 200 ? 'Inicio de sesión exitoso' : 'Intento de inicio de sesión fallido';
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

      // Si no calza con ninguno específico pero es una mutación, lo ignoramos o podríamos usar una genérica.
      // Pero dado que el usuario pidió modular y bien organizado, auditar estas 7 entidades cubre el 100% de la BD.
      if (!modeloPrisma) {
        return;
      }

      // Preparar los detalles
      const detalles = {
        body: sanitizarCuerpo(body),
        query: Object.keys(query).length > 0 ? query : undefined,
        params: req.params && Object.keys(req.params).length > 0 ? req.params : undefined
      };

      // Guardar en la tabla modular correspondiente de base de datos
      await modeloPrisma.create({
        data: {
          usuario_id: usuarioId,
          email: email || 'Anónimo / No identificado',
          accion,
          detalles: JSON.stringify(detalles),
          ip: ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          estado_codigo: res.statusCode
        }
      });

    } catch (error) {
      console.error('Error al registrar auditoría modular:', error);
    }
  });

  next();
}
