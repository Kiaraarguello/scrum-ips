import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  onClickTarea?: (tarea: Tarea) => void;
  onEliminarTarea?: (tarea: Tarea) => void;
}

export default function ColumnaTablero({ estado, tareas, onClickTarea, onEliminarTarea }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });
  const { usuario } = useAuth();

  const esMia = (t: Tarea) => {
    return t.asignados?.some((u) => u.id === usuario?.id) || t.asignado_a === usuario?.id;
  };

  const misTareas = tareas.filter(esMia);
  const otrasTareas = tareas.filter((t) => !esMia(t));

  return (
    <div 
      ref={setNodeRef} 
      className={`columna-tablero columna-tablero--${estado} ${isOver ? 'columna-tablero--sobre' : ''}`}
    >
      <div className="columna-tablero__cabecera">
        <h2 className="columna-tablero__titulo">{TITULOS[estado]}</h2>
        <span className="columna-tablero__contador">{tareas.length}</span>
      </div>
      <div className="columna-tablero__lista">
        <SortableContext items={tareas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {misTareas.length > 0 && (
            <div className="columna-tablero__grupo-tareas">
              <div className="columna-tablero__subseccion-cabecera">
                <span className="columna-tablero__subseccion-tag">Mis Tareas</span>
                <div className="columna-tablero__subseccion-linea"></div>
              </div>
              <div className="columna-tablero__grupo-lista">
                {misTareas.map((tarea) => (
                  <TarjetaTarea 
                    key={tarea.id} 
                    tarea={tarea} 
                    esMia={true}
                    onClick={() => onClickTarea?.(tarea)} 
                    onEliminar={onEliminarTarea ? () => onEliminarTarea(tarea) : undefined} 
                  />
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
                  <TarjetaTarea 
                    key={tarea.id} 
                    tarea={tarea} 
                    esMia={false}
                    onClick={() => onClickTarea?.(tarea)} 
                    onEliminar={onEliminarTarea ? () => onEliminarTarea(tarea) : undefined} 
                  />
                ))}
              </div>
            </div>
          )}
        </SortableContext>
        {tareas.length === 0 && (
          <div className="columna-tablero__vacia">Sin tareas</div>
        )}
      </div>
    </div>
  );
}
