import { useDroppable } from '@dnd-kit/core';
import type { Tarea, EstadoTarea } from '../../tipos';
import { useAuth } from '../../contextos/ContextoAuth';
import TarjetaTarea from '../TarjetaTarea/TarjetaTarea';
import './ColumnaTablero.css';

const TITULOS: Record<EstadoTarea, string> = {
  por_hacer: 'Por hacer',
  en_proceso: 'En proceso',
  finalizada: 'Finalizadas',
  pendiente: 'Pendientes',
};

interface Props {
  estado: EstadoTarea;
  tareas: Tarea[];
  resaltada?: boolean;
  onClickTarea?: (tarea: Tarea) => void;
  onEliminarTarea?: (tarea: Tarea) => void;
  onCambiarEstado?: (tarea: Tarea, nuevoEstado: EstadoTarea) => void;
  puedeMover?: (tarea: Tarea) => boolean;
  puedeFinalizar?: (tarea: Tarea) => boolean;
  esBacklog?: boolean;
}

export default function ColumnaTablero({
  estado,
  tareas,
  resaltada = false,
  onClickTarea,
  onEliminarTarea,
  onCambiarEstado,
  puedeMover,
  puedeFinalizar,
  esBacklog = false,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });
  const { usuario } = useAuth();

  const esMia = (t: Tarea) => {
    return t.asignados?.some((u) => u.id === usuario?.id) || t.asignado_a === usuario?.id;
  };

  const misTareas = tareas.filter(esMia);
  const otrasTareas = tareas.filter((t) => !esMia(t));
  const activa = isOver || resaltada;

  const propsTarjeta = (tarea: Tarea, esMiaTarjeta: boolean) => ({
    tarea,
    esMia: esMiaTarjeta,
    esBacklog,
    onClick: () => onClickTarea?.(tarea),
    onEliminar: onEliminarTarea ? () => onEliminarTarea(tarea) : undefined,
    onCambiarEstado: onCambiarEstado ? (nuevo: EstadoTarea) => onCambiarEstado(tarea, nuevo) : undefined,
    puedeMover: puedeMover?.(tarea) ?? false,
    puedeFinalizar: puedeFinalizar?.(tarea) ?? false,
  });

  return (
    <div
      ref={setNodeRef}
      className={`columna-tablero columna-tablero--${estado} ${activa ? 'columna-tablero--sobre' : ''}`}
    >
      <div className="columna-tablero__cabecera">
        <h2 className="columna-tablero__titulo">{TITULOS[estado]}</h2>
        <span className="columna-tablero__contador">{tareas.length}</span>
      </div>
      <div className="columna-tablero__lista">
        {misTareas.length > 0 && (
          <div className="columna-tablero__grupo-tareas">
            <div className="columna-tablero__subseccion-cabecera">
              <span className="columna-tablero__subseccion-tag">Mis Tareas</span>
              <div className="columna-tablero__subseccion-linea"></div>
            </div>
            <div className="columna-tablero__grupo-lista">
              {misTareas.map((tarea) => (
                <TarjetaTarea key={tarea.id} {...propsTarjeta(tarea, true)} />
              ))}
            </div>
          </div>
        )}

        {otrasTareas.length > 0 && (
          <div className="columna-tablero__grupo-tareas" style={{ marginTop: misTareas.length > 0 ? '16px' : '0' }}>
            {misTareas.length > 0 && (
              <div className="columna-tablero__subseccion-cabecera">
                <span className="columna-tablero__subseccion-tag columna-tablero__subseccion-tag--otras">Otras Tareas</span>
                <div className="columna-tablero__subseccion-linea"></div>
              </div>
            )}
            <div className="columna-tablero__grupo-lista">
              {otrasTareas.map((tarea) => (
                <TarjetaTarea key={tarea.id} {...propsTarjeta(tarea, false)} />
              ))}
            </div>
          </div>
        )}
        <div className={`columna-tablero__zona-soltar ${tareas.length === 0 ? 'columna-tablero__zona-soltar--vacia' : ''}`}>
          {tareas.length === 0 && <span className="columna-tablero__vacia">Soltá acá o usá los botones de la tarjeta</span>}
        </div>
      </div>
    </div>
  );
}
