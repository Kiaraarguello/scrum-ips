/** Obtiene la IP real del cliente (soporta proxy reverso). */
export function obtenerIpCliente(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'desconocida';
}

export function normalizarTitulo(titulo) {
  return titulo.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function normalizarDni(dni) {
  return String(dni).replace(/\D/g, '');
}

export function normalizarTelefono(telefono) {
  return String(telefono).replace(/\D/g, '');
}

const MAX_POR_IP_EN_VENTANA = 5;
const MAX_POR_DNI_EN_VENTANA = 3;
const VENTANA_RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hora
const VENTANA_DUPLICADO_MS = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Valida límites anti-spam para solicitudes públicas.
 * @returns {{ ok: true } | { ok: false, status: number, detail: string }}
 */
export async function validarLimiteSolicitudPublica(prisma, {
  ip,
  dni,
  telefono,
  titulo,
  sedeId,
}) {
  const desdeRateLimit = new Date(Date.now() - VENTANA_RATE_LIMIT_MS);
  const desdeDuplicado = new Date(Date.now() - VENTANA_DUPLICADO_MS);
  const tituloNorm = normalizarTitulo(titulo);
  const dniNorm = normalizarDni(dni);
  const telNorm = normalizarTelefono(telefono);

  const filtroPublico = { dni_contacto: { not: null } };

  const [porIp, porDni, duplicada] = await Promise.all([
    prisma.tarea.count({
      where: {
        ...filtroPublico,
        solicitud_ip: ip,
        fecha_creacion: { gte: desdeRateLimit },
      },
    }),
    prisma.tarea.count({
      where: {
        ...filtroPublico,
        dni_contacto: dniNorm,
        fecha_creacion: { gte: desdeRateLimit },
      },
    }),
    prisma.tarea.findFirst({
      where: {
        ...filtroPublico,
        sede_id: sedeId,
        dni_contacto: dniNorm,
        titulo_normalizado: tituloNorm,
        fecha_creacion: { gte: desdeDuplicado },
        estado: { in: ['por_hacer', 'en_proceso', 'pendiente'] },
      },
      select: { id: true },
    }),
  ]);

  if (porIp >= MAX_POR_IP_EN_VENTANA) {
    return {
      ok: false,
      status: 429,
      detail: 'Demasiadas solicitudes desde esta conexión. Esperá unos minutos e intentá de nuevo.',
    };
  }

  if (porDni >= MAX_POR_DNI_EN_VENTANA) {
    return {
      ok: false,
      status: 429,
      detail: 'Ya enviaste varias solicitudes recientemente. Esperá un rato antes de mandar otra.',
    };
  }

  if (duplicada) {
    return {
      ok: false,
      status: 409,
      detail: `Ya tenés una solicitud similar en curso (#${duplicada.id}). Aguardá a que la resuelvan antes de reenviar.`,
    };
  }

  // Mismo teléfono + título casi idéntico en ventana corta
  if (telNorm.length >= 6) {
    const porTelefono = await prisma.tarea.findFirst({
      where: {
        ...filtroPublico,
        sede_id: sedeId,
        titulo_normalizado: tituloNorm,
        numero_contacto: { contains: telNorm.slice(-8) },
        fecha_creacion: { gte: desdeRateLimit },
        estado: { in: ['por_hacer', 'en_proceso', 'pendiente'] },
      },
      select: { id: true },
    });
    if (porTelefono) {
      return {
        ok: false,
        status: 409,
        detail: `Detectamos una solicitud igual reciente (#${porTelefono.id}). Si es urgente, contactá a sistemas por teléfono.`,
      };
    }
  }

  return { ok: true, dniNorm, tituloNorm };
}
