import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { HistorialMovimiento } from '../../tipos';
import { listarHistorial } from '../../servicios/historial';
import { formatearFechaHora } from '../../utilidades/formatoFecha';
import './HistorialTareas.css';

const ETIQUETAS: Record<string, string> = {
  por_hacer: 'Por hacer',
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
};

export default function HistorialTareas() {
  const [movimientos, setMovimientos] = useState<HistorialMovimiento[]>([]);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tareaId = searchParams.get('tarea_id');
    listarHistorial(tareaId ? { tarea_id: Number(tareaId) } : {}).then(setMovimientos);
  }, [searchParams]);

  return (
    <div className="historial-tareas pagina pagina--centrada">
      <Link to="/admin" className="btn-volver">
        <ArrowLeft size={18} />
        Volver al Panel Admin
      </Link>
      <h1 className="historial-tareas__titulo">Historial de tareas</h1>
      <div className="historial-tareas__tabla-envolvente">
        <table className="historial-tareas__tabla">
          <thead>
            <tr>
              <th>Tarea</th><th>Usuario</th><th>De</th><th>A</th><th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id}>
                <td>{m.tarea?.titulo ?? `#${m.tarea_id}`}</td>
                <td>{m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido}` : '-'}</td>
                <td>{m.estado_anterior ? ETIQUETAS[m.estado_anterior] ?? m.estado_anterior : '-'}</td>
                <td><span className={`historial-tareas__estado historial-tareas__estado--${m.estado_nuevo}`}>{ETIQUETAS[m.estado_nuevo] ?? m.estado_nuevo}</span></td>
                <td>{formatearFechaHora(m.fecha_movimiento)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {movimientos.length === 0 && <p className="historial-tareas__vacio">Sin movimientos registrados</p>}
      </div>
    </div>
  );
}
