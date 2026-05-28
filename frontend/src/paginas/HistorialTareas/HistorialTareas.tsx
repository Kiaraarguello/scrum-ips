import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import type { HistorialMovimiento } from '../../tipos';
import { listarHistorial } from '../../servicios/historial';
import { formatearFechaHora } from '../../utilidades/formatoFecha';
import './HistorialTareas.css';

const ETIQUETAS: Record<string, string> = {
  por_hacer: 'Por hacer',
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
  pendiente: 'Pendiente',
};

export default function HistorialTareas() {
  const [movimientos, setMovimientos] = useState<HistorialMovimiento[]>([]);
  const [searchParams] = useSearchParams();

  // Filtros y ordenamiento
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('reciente');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    const tareaId = searchParams.get('tarea_id');
    listarHistorial(tareaId ? { tarea_id: Number(tareaId) } : {}).then(setMovimientos);
  }, [searchParams]);

  // Filtrado de movimientos en base a la búsqueda y estado
  const movimientosFiltrados = movimientos.filter((m) => {
    // Filtrar por estado seleccionado
    if (filtroEstado !== 'todos' && m.estado_nuevo !== filtroEstado) {
      return false;
    }
    
    // Filtrar por texto de búsqueda
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const idMatch = m.tarea_id.toString().includes(q) || `#${m.tarea_id}`.includes(q);
      const tituloMatch = m.tarea?.titulo?.toLowerCase().includes(q) || false;
      
      const usuarioNombre = m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido}`.toLowerCase() : '';
      const usuarioMatch = usuarioNombre.includes(q);
      
      const estadoTexto = (ETIQUETAS[m.estado_nuevo] ?? m.estado_nuevo).toLowerCase();
      const estadoMatch = estadoTexto.includes(q) || m.estado_nuevo.toLowerCase().includes(q);

      const fechaTexto = formatearFechaHora(m.fecha_movimiento).toLowerCase();
      const fechaMatch = fechaTexto.includes(q);

      return idMatch || tituloMatch || usuarioMatch || estadoMatch || fechaMatch;
    }

    return true;
  });

  // Ordenar movimientos en base al criterio seleccionado
  const movimientosOrdenados = [...movimientosFiltrados].sort((a, b) => {
    const fechaA = new Date(a.fecha_movimiento).getTime();
    const fechaB = new Date(b.fecha_movimiento).getTime();
    return orden === 'reciente' ? fechaB - fechaA : fechaA - fechaB;
  });

  return (
    <div className="historial-tareas pagina pagina--centrada">
      <Link to="/admin" className="btn-volver">
        <ArrowLeft size={18} />
        Volver al Panel Admin
      </Link>
      <h1 className="historial-tareas__titulo">Historial de tareas</h1>

      {/* Controles de Búsqueda, Filtros y Ordenamiento */}
      <div className="historial-tareas__filtros-caja">
        <div className="historial-tareas__busqueda-wrapper">
          <Search size={18} className="historial-tareas__icono-buscar" />
          <input
            type="text"
            placeholder="Buscar por ID, tarea, usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="historial-tareas__input-busqueda"
          />
        </div>
        <div className="historial-tareas__controles-derecha">
          <div className="historial-tareas__filtro-item">
            <span className="historial-tareas__filtro-label">Ordenar:</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="historial-tareas__select"
            >
              <option value="reciente">Más reciente</option>
              <option value="antiguo">Más antiguo</option>
            </select>
          </div>
          <div className="historial-tareas__filtro-item">
            <span className="historial-tareas__filtro-label">Estado:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="historial-tareas__select"
            >
              <option value="todos">Todos los estados</option>
              <option value="por_hacer">Por hacer</option>
              <option value="en_proceso">En proceso</option>
              <option value="finalizada">Finalizada</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="historial-tareas__tabla-envolvente">
        <table className="historial-tareas__tabla">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {movimientosOrdenados.map((m) => (
              <tr key={m.id}>
                <td>{m.tarea?.titulo ?? `#${m.tarea_id}`}</td>
                <td>{m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido}` : '-'}</td>
                <td>
                  <span className={`historial-tareas__estado historial-tareas__estado--${m.estado_nuevo}`}>
                    {ETIQUETAS[m.estado_nuevo] ?? m.estado_nuevo}
                  </span>
                </td>
                <td>{formatearFechaHora(m.fecha_movimiento)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {movimientosOrdenados.length === 0 && (
          <p className="historial-tareas__vacio">
            {movimientos.length === 0
              ? 'Sin movimientos registrados'
              : 'No se encontraron movimientos que coincidan con la búsqueda'}
          </p>
        )}
      </div>
    </div>
  );
}
