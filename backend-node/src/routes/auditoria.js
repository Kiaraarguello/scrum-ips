import { Router } from 'express';
import { prisma } from '../db.js';
import { requerirPermiso } from '../middleware/auth.js';

const router = Router();

router.get('/', requerirPermiso('auditoria_logs'), async (req, res) => {
  try {
    const { tipo = 'sesiones', pagina = 1, limite = 50 } = req.query;
    const paginaNum = Math.max(1, parseInt(String(pagina), 10) || 1);
    const limiteNum = Math.min(100, Math.max(1, parseInt(String(limite), 10) || 50));
    const skip = (paginaNum - 1) * limiteNum;

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
        take: limiteNum,
        include: {
          usuario: { select: { id: true, nombre: true, apellido: true, email: true } },
        },
      }),
    ]);

    return res.json({
      total,
      pagina: paginaNum,
      paginas_totales: Math.max(1, Math.ceil(total / limiteNum)),
      registros,
    });
  } catch (error) {
    console.error('Error al listar auditoría:', error);
    return res.status(500).json({
      detail: 'No se pudieron cargar los registros de auditoría. Verificá que existan las tablas auditoria_* en la base de datos.',
    });
  }
});

export default router;
