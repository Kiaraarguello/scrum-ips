import { Router } from 'express';
import { prisma } from '../db.js';
import { obtenerUsuarioActual, requerirSuperAdminOSuperior } from '../middleware/auth.js';

const router = Router();

// Estructura y valores por defecto para los permisos de los roles gestionables
export const MOCK_ESTRUCTURA_PERMISOS = {
  super_admin: [
    {
      titulo: 'Módulo: Tablero de Tareas',
      permisos: [
        { id: 'tablero_ver', nombre: 'Ver tablero completo', descripcion: 'Acceso de lectura a todas las columnas del tablero.', activoDefinido: true },
        { id: 'tablero_crear', nombre: 'Crear nuevas tareas', descripcion: 'Habilidad de registrar solicitudes y tickets de soporte.', activoDefinido: true },
        { id: 'tablero_mover', nombre: 'Mover y cambiar estados', descripcion: 'Iniciar, pausar o cancelar tareas en curso.', activoDefinido: true },
        { id: 'tablero_finalizar', nombre: 'Finalizar tareas', descripcion: 'Cerrar tareas ingresando diagnóstico y solución técnica.', activoDefinido: true },
      ],
    },
    {
      titulo: 'Módulo: Administración General',
      permisos: [
        { id: 'admin_panel', nombre: 'Acceso a Panel Admin', descripcion: 'Habilita el ingreso a las secciones administrativas de la app.', activoDefinido: true },
        { id: 'admin_usuarios', nombre: 'Administrar Usuarios', descripcion: 'Crear, editar o dar de baja cuentas y roles del personal.', activoDefinido: true },
        { id: 'admin_sectores_sedes', nombre: 'Administrar Sectores y Sedes', descripcion: 'Configurar sedes físicas y áreas departamentales.', activoDefinido: true },
      ],
    },
    {
      titulo: 'Módulo: Auditoría y Control',
      permisos: [
        { id: 'auditoria_logs', nombre: 'Logs de Auditoría', descripcion: 'Visualizar bitácora detallada de inicios de sesión y movimientos.', activoDefinido: false },
        { id: 'auditoria_stats', nombre: 'KPIs y Estadísticas', descripcion: 'Ver tableros de rendimiento y rankings de productividad.', activoDefinido: true },
      ],
    },
  ],
  admin: [
    {
      titulo: 'Módulo: Tablero de Tareas',
      permisos: [
        { id: 'tablero_ver', nombre: 'Ver tablero completo', descripcion: 'Acceso de lectura a todas las columnas del tablero.', activoDefinido: true },
        { id: 'tablero_crear', nombre: 'Crear nuevas tareas', descripcion: 'Habilidad de registrar solicitudes y tickets de soporte.', activoDefinido: true },
        { id: 'tablero_mover', nombre: 'Mover y cambiar estados', descripcion: 'Iniciar, pausar o cancelar tareas en curso.', activoDefinido: true },
        { id: 'tablero_finalizar', nombre: 'Finalizar tareas', descripcion: 'Cerrar tareas ingresando diagnóstico y solución técnica.', activoDefinido: true },
      ],
    },
    {
      titulo: 'Módulo: Administración General',
      permisos: [
        { id: 'admin_panel', nombre: 'Acceso a Panel Admin', descripcion: 'Habilita el ingreso a las secciones administrativas de la app.', activoDefinido: true },
        { id: 'admin_usuarios', nombre: 'Administrar Usuarios', descripcion: 'Crear, editar o dar de baja cuentas y roles del personal.', activoDefinido: false },
        { id: 'admin_sectores_sedes', nombre: 'Administrar Sectores y Sedes', descripcion: 'Configurar sedes físicas y áreas departamentales.', activoDefinido: true },
      ],
    },
    {
      titulo: 'Módulo: Auditoría y Control',
      permisos: [
        { id: 'auditoria_logs', nombre: 'Logs de Auditoría', descripcion: 'Visualizar bitácora detallada de inicios de sesión y movimientos.', activoDefinido: false },
        { id: 'auditoria_stats', nombre: 'KPIs y Estadísticas', descripcion: 'Ver tableros de rendimiento y rankings de productividad.', activoDefinido: true },
      ],
    },
  ],
  usuario: [
    {
      titulo: 'Módulo: Tablero de Tareas',
      permisos: [
        { id: 'tablero_ver', nombre: 'Ver tablero de mi sector', descripcion: 'Acceso de lectura limitado a tareas de su sector asignado.', activoDefinido: true },
        { id: 'tablero_crear', nombre: 'Crear nuevas tareas', descripcion: 'Habilidad de registrar solicitudes y tickets de soporte.', activoDefinido: true },
        { id: 'tablero_mover', nombre: 'Mover mis tareas', descripcion: 'Iniciar o pausar únicamente tareas que le fueron asignadas.', activoDefinido: true },
        { id: 'tablero_finalizar', nombre: 'Finalizar mis tareas', descripcion: 'Cerrar tareas ingresando diagnóstico y solución técnica.', activoDefinido: true },
      ],
    },
    {
      titulo: 'Módulo: Administración General',
      permisos: [
        { id: 'admin_panel', nombre: 'Acceso a Panel Admin', descripcion: 'Habilita el ingreso a las secciones administrativas de la app.', activoDefinido: false },
        { id: 'admin_usuarios', nombre: 'Administrar Usuarios', descripcion: 'Crear, editar o dar de baja cuentas y roles del personal.', activoDefinido: false },
        { id: 'admin_sectores_sedes', nombre: 'Administrar Sectores y Sedes', descripcion: 'Configurar sedes físicas y áreas departamentales.', activoDefinido: false },
      ],
    },
    {
      titulo: 'Módulo: Auditoría y Control',
      permisos: [
        { id: 'auditoria_logs', nombre: 'Logs de Auditoría', descripcion: 'Visualizar bitácora detallada de inicios de sesión y movimientos.', activoDefinido: false },
        { id: 'auditoria_stats', nombre: 'KPIs y Estadísticas', descripcion: 'Ver tableros de rendimiento y rankings de productividad.', activoDefinido: false },
      ],
    },
  ],
};

// Obtiene un mapeo simple del tipo { clave: activo } para un rol específico
export async function obtenerPermisosRol(rol) {
  if (rol === 'super_usuario') {
    // El Super Usuario tiene todos los accesos habilitados garantizados
    return {
      tablero_ver: true,
      tablero_crear: true,
      tablero_mover: true,
      tablero_finalizar: true,
      admin_panel: true,
      admin_usuarios: true,
      admin_sectores_sedes: true,
      auditoria_logs: true,
      auditoria_stats: true,
    };
  }

  // Buscar en BD
  const dbPermisos = await prisma.permisoRol.findMany({
    where: { rol },
  });

  const mapa = {};
  for (const p of dbPermisos) {
    mapa[p.clave] = p.activo;
  }

  // Si no está inicializado o faltan claves, recurrir al valor por defecto
  const modulosDefault = MOCK_ESTRUCTURA_PERMISOS[rol] || [];
  for (const modulo of modulosDefault) {
    for (const perm of modulo.permisos) {
      if (mapa[perm.id] === undefined) {
        // Se auto-cura guardando el valor por defecto
        await prisma.permisoRol.upsert({
          where: { rol_clave: { rol, clave: perm.id } },
          update: {},
          create: {
            rol,
            clave: perm.id,
            activo: perm.activoDefinido,
          },
        });
        mapa[perm.id] = perm.activoDefinido;
      }
    }
  }

  return mapa;
}

// Helper para construir la estructura JSON completa y jerárquica para el frontend
async function construirEstructuraPermisosCompleta() {
  const resultado = {};

  for (const rol of ['super_admin', 'admin', 'usuario']) {
    const mapaActual = await obtenerPermisosRol(rol);
    resultado[rol] = MOCK_ESTRUCTURA_PERMISOS[rol].map(modulo => ({
      titulo: modulo.titulo,
      permisos: modulo.permisos.map(perm => ({
        id: perm.id,
        nombre: perm.nombre,
        descripcion: perm.descripcion,
        activo: mapaActual[perm.id] ?? perm.activoDefinido,
      })),
    }));
  }

  return resultado;
}

// GET /api/permisos
router.get('/', obtenerUsuarioActual, requerirSuperAdminOSuperior, async (req, res) => {
  try {
    const estructura = await construirEstructuraPermisosCompleta();
    return res.json(estructura);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    return res.status(500).json({ detail: 'Error al recuperar la configuración de permisos.' });
  }
});

// PUT /api/permisos/:rol
router.put('/:rol', obtenerUsuarioActual, requerirSuperAdminOSuperior, async (req, res) => {
  try {
    const { rol } = req.params;
    const { modulos } = req.body;

    if (!['super_admin', 'admin', 'usuario'].includes(rol)) {
      return res.status(400).json({ detail: 'Rol inválido para configurar permisos.' });
    }

    if (!modulos || !Array.isArray(modulos)) {
      return res.status(400).json({ detail: 'Formato de módulos incorrecto.' });
    }

    for (const modulo of modulos) {
      if (modulo.permisos && Array.isArray(modulo.permisos)) {
        for (const perm of modulo.permisos) {
          await prisma.permisoRol.upsert({
            where: {
              rol_clave: { rol, clave: perm.id }
            },
            update: {
              activo: Boolean(perm.activo)
            },
            create: {
              rol,
              clave: perm.id,
              activo: Boolean(perm.activo)
            }
          });
        }
      }
    }

    return res.json({ detail: 'Permisos actualizados correctamente.' });
  } catch (error) {
    console.error('Error al actualizar permisos:', error);
    return res.status(500).json({ detail: 'Error al actualizar permisos en base de datos.' });
  }
});

export default router;
