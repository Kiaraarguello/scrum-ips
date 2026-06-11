import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, RefreshCw, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tarea, EstadoTarea } from '../../tipos';
import { listarTareas, moverTarea, eliminarTarea } from '../../servicios/tareas';
import { ordenarPorCriticidad } from '../../utilidades/pesoCriticidad';
import { tienePermiso } from '../../utilidades/permisos';
import { useAuth } from '../../contextos/ContextoAuth';
import ColumnaTablero from '../../componentes/ColumnaTablero/ColumnaTablero';
import {
  COLUMNAS_TABLERO,
  deteccionColisionTablero,
  resolverColumnaDestino,
} from '../../utilidades/tableroDnd';
import ModalNuevaTarea from '../../componentes/ModalNuevaTarea/ModalNuevaTarea';
import ModalEditarTarea from '../../componentes/ModalEditarTarea/ModalEditarTarea';
import ModalAsignarUsuario from '../../componentes/ModalAsignarUsuario/ModalAsignarUsuario';
import ModalFinalizarTarea from '../../componentes/ModalFinalizarTarea/ModalFinalizarTarea';
import Boton from '../../componentes/Boton/Boton';
import './Tablero.css';

const INTERVALO_MS = 60_000;
type ModoFinalizar = 'finalizada' | 'pendiente';

interface Props {
  proyectoId?: number;
  tituloPersonalizado?: string;
}

export default function Tablero({ proyectoId, tituloPersonalizado }: Props) {
  const { usuario } = useAuth();
  const navegar = useNavigate();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tareaParaEditar, setTareaParaEditar] = useState<Tarea | null>(null);
  const [tareaParaAsignar, setTareaParaAsignar] = useState<{ tarea: Tarea; nuevoEstado: string } | null>(null);
  const [tareaParaFinalizar, setTareaParaFinalizar] = useState<Tarea | null>(null);
  const [modoFinalizar, setModoFinalizar] = useState<ModoFinalizar>('finalizada');
  const [columnaDestino, setColumnaDestino] = useState<EstadoTarea | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const arrastrando = useRef(false);
  const columnaDestinoRef = useRef<EstadoTarea | null>(null);

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
  }, [proyectoId]);

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

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const esMia = useCallback(
    (t: Tarea) => t.asignados?.some((u) => u.id === usuario?.id) || t.asignado_a === usuario?.id,
    [usuario?.id]
  );

  const puedeMoverTarea = useCallback(
    (t: Tarea) => tienePermiso(usuario, 'tablero_mover') || esMia(t),
    [usuario, esMia]
  );

  const puedeFinalizarTarea = useCallback(
    (t: Tarea) => tienePermiso(usuario, 'tablero_finalizar') || esMia(t),
    [usuario, esMia]
  );

  function tareasPorEstado(estado: EstadoTarea) {
    let filtradas = tareas.filter((t) => t.estado === estado);
    if (filtroBusqueda.trim()) {
      const query = filtroBusqueda.toLowerCase().trim();
      filtradas = filtradas.filter((t) => {
        const idMatch = t.id.toString() === query || `#${t.id}`.toLowerCase() === query;
        const tituloMatch = t.titulo.toLowerCase().includes(query);
        const notaMatch = t.nota_llamada?.toLowerCase().includes(query) ?? false;
        const contactoMatch = t.numero_contacto?.toLowerCase().includes(query) ?? false;
        const sedeMatch = t.sede?.nombre.toLowerCase().includes(query) ?? false;
        const sectorMatch = t.sector?.nombre.toLowerCase().includes(query) ?? false;
        const creadorMatch = t.creador ? `${t.creador.nombre} ${t.creador.apellido}`.toLowerCase().includes(query) : false;
        const asignadosMatch = t.asignados?.some(u => `${u.nombre} ${u.apellido}`.toLowerCase().includes(query)) ?? false;
        return idMatch || tituloMatch || notaMatch || contactoMatch || sedeMatch || sectorMatch || creadorMatch || asignadosMatch;
      });
    }
    return ordenarPorCriticidad(filtradas);
  }

  function manejarDragOver(evento: DragOverEvent) {
    const col = resolverColumnaDestino(evento.over?.id, tareas);
    columnaDestinoRef.current = col;
    setColumnaDestino(col);
  }

  function limpiarArrastre() {
    arrastrando.current = false;
    columnaDestinoRef.current = null;
    setColumnaDestino(null);
  }

  async function solicitarCambioEstado(tarea: Tarea, nuevoEstado: EstadoTarea) {
    if (tarea.estado === nuevoEstado) return;

    if (!puedeMoverTarea(tarea)) {
      alert('No tienes permisos para mover o cambiar el estado de tareas que no te pertenecen.');
      return;
    }

    if (nuevoEstado === 'finalizada' || nuevoEstado === 'pendiente') {
      if (!puedeFinalizarTarea(tarea)) {
        alert('No tienes permisos para finalizar o dejar pendientes tareas que no te pertenecen.');
        return;
      }
      setModoFinalizar(nuevoEstado);
      setTareaParaFinalizar(tarea);
      return;
    }

    if (tarea.estado === 'por_hacer' && nuevoEstado === 'en_proceso') {
      setTareaParaAsignar({ tarea, nuevoEstado });
      return;
    }

    setTareas((prev) => prev.map((t) => (t.id === tarea.id ? { ...t, estado: nuevoEstado } : t)));
    try {
      await moverTarea(tarea.id, nuevoEstado);
    } catch {
      cargar();
    }
  }

  async function manejarDragEnd(evento: DragEndEvent) {
    const { active, over } = evento;
    const nuevoEstado =
      resolverColumnaDestino(over?.id, tareas) ?? columnaDestinoRef.current;
    limpiarArrastre();

    const idTarea = Number(active.id);
    const tarea = tareas.find((t) => t.id === idTarea);

    if (!tarea || !nuevoEstado || tarea.estado === nuevoEstado) return;
    await solicitarCambioEstado(tarea, nuevoEstado);
  }

  async function confirmarFinalizacion(nuevoEstado: 'finalizada' | 'pendiente', descripcion: string) {
    if (!tareaParaFinalizar) return;
    const tId = tareaParaFinalizar.id;
    setTareaParaFinalizar(null);

    // Actualización optimista
    setTareas((prev) =>
      prev.map((t) => {
        if (t.id === tId) {
          return {
            ...t,
            estado: nuevoEstado,
            solucion: nuevoEstado === 'finalizada' ? descripcion : t.solucion,
            pendiente_descripcion: nuevoEstado === 'pendiente' ? descripcion : t.pendiente_descripcion
          };
        }
        return t;
      })
    );

    try {
      const actualizada = await moverTarea(
        tId,
        nuevoEstado,
        undefined,
        nuevoEstado === 'finalizada' ? descripcion : undefined,
        nuevoEstado === 'pendiente' ? descripcion : undefined
      );
      setTareas((prev) => prev.map((t) => (t.id === tId ? actualizada : t)));
    } catch {
      cargar();
    }
  }

  async function confirmarAsignacion(usuarioIds: number[]) {
    if (!tareaParaAsignar) return;
    const { tarea, nuevoEstado } = tareaParaAsignar;
    setTareaParaAsignar(null);
    setTareas((prev) =>
      prev.map((t) => (t.id === tarea.id ? { ...t, estado: nuevoEstado as EstadoTarea } : t))
    );
    try {
      const actualizada = await moverTarea(tarea.id, nuevoEstado, usuarioIds);
      setTareas((prev) => prev.map((t) => (t.id === tarea.id ? actualizada : t)));
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
          <Boton variante="secundario" onClick={() => navegar('/pendientes')} style={{ marginRight: '8px' }}>
            <Clock size={16} style={{ marginRight: '6px' }} />
            Pendientes
          </Boton>
          {tienePermiso(usuario, 'tablero_crear') && (
            <Boton onClick={() => setMostrarModal(true)}>
              <Plus size={16} />
              Nueva tarea
            </Boton>
          )}
        </div>
      </div>

      <div className="tablero__filtro-barra">
        <div className="tablero__busqueda-contenedor">
          <Search size={16} className="tablero__busqueda-icono" />
          <input
            type="text"
            className="tablero__busqueda-input"
            placeholder="Buscar por ID, título, sector, sede, contacto, equipo..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
          />
          {filtroBusqueda && (
            <button className="tablero__busqueda-limpiar" onClick={() => setFiltroBusqueda('')} title="Limpiar búsqueda">
              ✕
            </button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensores}
        collisionDetection={deteccionColisionTablero}
        onDragStart={() => {
          arrastrando.current = true;
        }}
        onDragOver={manejarDragOver}
        onDragEnd={manejarDragEnd}
        onDragCancel={limpiarArrastre}
      >
        <SortableContext
          items={tareas.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="tablero__columnas">
            {COLUMNAS_TABLERO.map((estado) => (
              <ColumnaTablero
                key={estado}
                estado={estado}
                tareas={tareasPorEstado(estado)}
                resaltada={columnaDestino === estado}
                onClickTarea={(t) => setTareaParaEditar(t)}
                onEliminarTarea={
                  tienePermiso(usuario, 'tablero_eliminar') ? archivarTarea : undefined
                }
                onCambiarEstado={solicitarCambioEstado}
                puedeMover={puedeMoverTarea}
                puedeFinalizar={puedeFinalizarTarea}
              />
            ))}
          </div>
        </SortableContext>
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
          usuarioIdsPrevios={tareaParaAsignar.tarea.asignados?.map((u) => u.id) ?? []}
          onConfirmar={confirmarAsignacion}
          onCancelar={() => { setTareaParaAsignar(null); }}
        />
      )}

      {tareaParaEditar && (
        <ModalEditarTarea
          tarea={tareaParaEditar}
          onCerrar={() => setTareaParaEditar(null)}
          onActualizada={() => {
            setTareaParaEditar(null);
            cargar();
          }}
        />
      )}

      {tareaParaFinalizar && (
        <ModalFinalizarTarea
          tarea={tareaParaFinalizar}
          modoInicial={modoFinalizar}
          onCerrar={() => setTareaParaFinalizar(null)}
          onConfirmar={confirmarFinalizacion}
        />
      )}
    </div>
  );
}
