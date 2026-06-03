import { Router } from 'express';
import { prisma } from '../db.js';
import { requerirSuperUsuario, requerirPermiso } from '../middleware/auth.js';

const router = Router();

// GET /api/auditoria
router.get('/', requerirPermiso('auditoria_logs'), async (req, res) => {
  const { tipo = 'sesiones', pagina = 1, limite = 50 } = req.query;
  const skip = (Math.max(1, parseInt(pagina)) - 1) * parseInt(limite);
  const take = parseInt(limite);

  let modelo;
  switch (tipo) {
    case 'sesiones': modelo = prisma.auditoriaSesion; break;
    case 'usuarios': modelo = prisma.auditoriaUsuario; break;
    case 'sectores': modelo = prisma.auditoriaSector; break;
    case 'sedes': modelo = prisma.auditoriaSede; break;
    case 'tareas': modelo = prisma.auditoriaTarea; break;
    case 'pcs': modelo = prisma.auditoriaPc; break;
    case 'proyectos': modelo = prisma.auditoriaProyecto; break;
    default: return res.status(400).json({ detail: 'Tipo de auditoría inválido' });
  }

  const [total, registros] = await Promise.all([
    modelo.count(),
    modelo.findMany({
      orderBy: { fecha_creacion: 'desc' },
      skip,
      take,
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true, email: true } }
      }
    })
  ]);

  return res.json({
    total,
    pagina: parseInt(pagina),
    paginas_totales: Math.ceil(total / take),
    registros
  });
});

export default router;
