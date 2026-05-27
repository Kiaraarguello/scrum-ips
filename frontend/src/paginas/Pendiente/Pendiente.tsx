import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Play, MapPin, Layers, Phone, User, Smile } from 'lucide-react';
import type { Tarea } from '../../tipos';
import { listarTareas, moverTarea } from '../../servicios/tareas';
import { formatearFechaHora } from '../../utilidades/formatoFecha';
import { ordenarPorCriticidad } from '../../utilidades/pesoCriticidad';
import Boton from '../../componentes/Boton/Boton';
import BadgeCriticidad from '../../componentes/BadgeCriticidad/BadgeCriticidad';
import './Pendiente.css';

export default function Pendiente() {
  const navegar = useNavigate();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarTareas = useCallback(async () => {
    setCargando(true);
    try {
      const lista = await listarTareas();
      // Filtrar únicamente las tareas que están en estado 'pendiente'
      const pendientes = lista.filter((t) => t.estado === 'pendiente');
      // Ordenar por criticidad (alta, media, baja) para mantener prioridad
      setTareas(ordenarPorCriticidad(pendientes));
    } catch (err) {
      console.error('Error al cargar tareas pendientes:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTareas();
  }, [cargarTareas]);

  async function reactivarTarea(id: number) {
    try {
      // Mover la tarea de vuelta al estado 'en_proceso'
      await moverTarea(id, 'en_proceso');
      // Quitarla del listado local de forma optimista
      setTareas((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error al reactivar la tarea:', err);
      cargarTareas();
    }
  }

  return (
    <div className="pendiente-pag">
      
      {/* Header and navigation */}
      <div className="pendiente-pag__cabecera">
        <div className="pendiente-pag__cabecera-info">
          <button 
            className="btn-volver" 
            onClick={() => navegar('/tablero')}
            title="Volver al tablero"
          >
            <ArrowLeft size={16} />
            Volver al Tablero
          </button>
          <h1 className="pendiente-pag__titulo">Tareas Pendientes</h1>
          <span className="pendiente-pag__subtitulo">
            Listado de tickets pausados en espera de repuestos, compras o acciones de terceros.
          </span>
        </div>
      </div>

      {cargando ? (
        <div className="pendiente-pag__vacio" style={{ borderStyle: 'solid' }}>
          <div className="tablero__spin" style={{ display: 'inline-block' }}>
            <Clock size={32} className="tablero__spin" style={{ color: 'var(--azul-institucional)' }} />
          </div>
          <p className="pendiente-pag__vacio-titulo" style={{ marginTop: '16px' }}>Cargando tareas...</p>
        </div>
      ) : tareas.length === 0 ? (
        <div className="pendiente-pag__vacio">
          <div className="pendiente-pag__vacio-icono">
            <Smile size={32} />
          </div>
          <h2 className="pendiente-pag__vacio-titulo">¡Sin pendientes!</h2>
          <p className="pendiente-pag__vacio-desc">
            No tienes tareas pausadas o retenidas por terceros en este momento. ¡Buen trabajo!
          </p>
        </div>
      ) : (
        <div className="pendiente-pag__grid">
          {tareas.map((tarea) => (
            <div key={tarea.id} className="pendiente-tarjeta">
              
              <div className="pendiente-tarjeta__cabecera">
                <BadgeCriticidad criticidad={tarea.criticidad} />
                <span className="pendiente-tarjeta__fecha">
                  Creada {formatearFechaHora(tarea.fecha_creacion)}
                </span>
              </div>

              <h3 className="pendiente-tarjeta__titulo">{tarea.titulo}</h3>

              {/* Pending Reason Callout */}
              <div className="pendiente-tarjeta__motivo-box">
                <span className="pendiente-tarjeta__motivo-etiqueta">
                  Motivo del Pendiente
                </span>
                <span className="pendiente-tarjeta__motivo-texto">
                  {tarea.pendiente_descripcion || 'No se especificó un motivo de suspensión.'}
                </span>
              </div>

              {/* Task Metadata */}
              <div className="pendiente-tarjeta__meta-lista">
                {tarea.sede && (
                  <div className="pendiente-tarjeta__meta-item">
                    <MapPin size={13} />
                    <span>Sede: <strong>{tarea.sede.nombre}</strong></span>
                  </div>
                )}
                {tarea.sector && (
                  <div className="pendiente-tarjeta__meta-item">
                    <Layers size={13} />
                    <span>Sector: <strong>{tarea.sector.nombre}</strong></span>
                  </div>
                )}
                {tarea.numero_contacto && (
                  <div className="pendiente-tarjeta__meta-item">
                    <Phone size={13} />
                    <span>Contacto: {tarea.numero_contacto}</span>
                  </div>
                )}
                {tarea.asignados && tarea.asignados.length > 0 && (
                  <div className="pendiente-tarjeta__meta-item pendiente-tarjeta__meta-item--equipo">
                    <User size={13} />
                    <span>Asignado: {tarea.asignados.map(u => u.nombre).join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Reactivate Action Button */}
              <div className="pendiente-tarjeta__acciones">
                <Boton 
                  variante="primario" 
                  onClick={() => reactivarTarea(tarea.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Play size={14} fill="currentColor" />
                  Reactivar (Mover a En Proceso)
                </Boton>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
