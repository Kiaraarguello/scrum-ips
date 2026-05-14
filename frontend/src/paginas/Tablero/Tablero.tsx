import { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors, rectIntersection } from '@dnd-kit/core';
import { Plus, RefreshCw } from 'lucide-react';
import type { Tarea, EstadoTarea } from '../../tipos';
import { listarTareas, moverTarea, eliminarTarea } from '../../servicios/tareas';
import { ordenarPorCriticidad } from '../../utilidades/pesoCriticidad';
import { useAuth } from '../../contextos/ContextoAuth';
import ColumnaTablero from '../../componentes/ColumnaTablero/ColumnaTablero';
import ModalNuevaTarea from '../../componentes/ModalNuevaTarea/ModalNuevaTarea';
import ModalAsignarUsuario from '../../componentes/ModalAsignarUsuario/ModalAsignarUsuario';
import Boton from '../../componentes/Boton/Boton';
import './Tablero.css';

const COLUMNAS: EstadoTarea[] = ['por_hacer', 'en_proceso', 'finalizada'];
const INTERVALO_MS = 60_000;

interface Props {
  proyectoId?: number;
  tituloPersonalizado?: string;
}

export default function Tablero({ proyectoId, tituloPersonalizado }: Props) {
  const { usuario } = useAuth();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tareaParaAsignar, setTareaParaAsignar] = useState<{ tarea: Tarea; nuevoEstado: string } | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const arrastrando = useRef(false);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setActualizando(true);
    try {
      const data = await listarTareas(proyectoId);
      setTareas(data);
      setUltimaActualizacion(new Date());
    } catch {
      // fallo silencioso — no borrar las tareas existentes
    } finally {
      if (!silencioso) setActualizando(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    if (usuario) cargar();
  }, [usuario?.id, cargar]);

  // Polling automático
  useEffect(() => {
    const tick = () => {
      // No actualizar si hay un drag activo o un modal abierto
      if (arrastrando.current || mostrarModal || tareaParaAsignar) return;
      cargar(true);
    };

    const id = setInterval(tick, INTERVALO_MS);
    return () => clearInterval(id);
  }, [cargar, mostrarModal, tareaParaAsignar]);

  // Re-fetch al volver a la pestaña
  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState === 'visible') cargar(true);
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => document.removeEventListener('visibilitychange', alVolver);
  }, [cargar]);

  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function tareasPorEstado(estado: EstadoTarea) {
    return ordenarPorCriticidad(tareas.filter((t) => t.estado === estado));
  }

  async function manejarDragEnd(evento: DragEndEvent) {
    arrastrando.current = false;
    const { active, over } = evento;
    if (!over) return;

    const idTarea = Number(active.id);
    const nuevoEstado = over.id as EstadoTarea;
    const tarea = tareas.find((t) => t.id === idTarea);

    if (!tarea || tarea.estado === nuevoEstado) return;

    if (tarea.estado === 'por_hacer' && nuevoEstado === 'en_proceso') {
      setTareaParaAsignar({ tarea, nuevoEstado });
      return;
    }

    setTareas((prev) => prev.map((t) => (t.id === idTarea ? { ...t, estado: nuevoEstado } : t)));
    try {
      await moverTarea(idTarea, nuevoEstado);
    } catch {
      cargar();
    }
  }

  async function confirmarAsignacion(usuarioId: number) {
    if (!tareaParaAsignar) return;
    const { tarea, nuevoEstado } = tareaParaAsignar;
    setTareaParaAsignar(null);
    setTareas((prev) =>
      prev.map((t) => (t.id === tarea.id ? { ...t, estado: nuevoEstado as EstadoTarea, asignado_a: usuarioId } : t))
    );
    try {
      await moverTarea(tarea.id, nuevoEstado, usuarioId);
    } catch {
      cargar();
    }
  }

  async function archivarTarea(tarea: Tarea) {
    setTareas(prev => prev.filter(t => t.id !== tarea.id));
    try {
      await eliminarTarea(tarea.id);
    } catch {
      cargar();
    }
  }

  function formatearHora(fecha: Date) {
    return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  return (
    <div className="tablero">
      <div className="tablero__cabecera">
        <h1 className="tablero__titulo">{tituloPersonalizado || 'Tablero de tareas'}</h1>
        <div className="tablero__cabecera-acciones">
          <div className="tablero__sync">
            <span className={`tablero__sync-dot ${actualizando ? 'tablero__sync-dot--activo' : ''}`} />
            {ultimaActualizacion && (
              <span className="tablero__sync-hora">
                Actualizado {formatearHora(ultimaActualizacion)}
              </span>
            )}
            <button
              className="tablero__sync-btn"
              onClick={() => cargar()}
              disabled={actualizando}
              title="Actualizar ahora"
            >
              <RefreshCw size={14} className={actualizando ? 'tablero__spin' : ''} />
            </button>
          </div>
          <Boton onClick={() => setMostrarModal(true)}>
            <Plus size={16} />
            Nueva tarea
          </Boton>
        </div>
      </div>

      <DndContext
        sensors={sensores}
        collisionDetection={rectIntersection}
        onDragStart={() => { arrastrando.current = true; }}
        onDragEnd={manejarDragEnd}
        onDragCancel={() => { arrastrando.current = false; }}
      >
        <div className="tablero__columnas">
          {COLUMNAS.map((estado) => (
            <ColumnaTablero key={estado} estado={estado} tareas={tareasPorEstado(estado)} onEliminarTarea={archivarTarea} />
          ))}
        </div>
      </DndContext>

      {mostrarModal && (
        <ModalNuevaTarea 
          onCerrar={() => setMostrarModal(false)} 
          onCreada={() => { setMostrarModal(false); cargar(); }} 
          proyectoId={proyectoId}
        />
      )}

      {tareaParaAsignar && (
        <ModalAsignarUsuario
          sectorId={tareaParaAsignar.tarea.sector_id}
          usuarioIdPrevio={tareaParaAsignar.tarea.asignado_a}
          onConfirmar={confirmarAsignacion}
          onCancelar={() => { setTareaParaAsignar(null); }}
        />
      )}
    </div>
  );
}
