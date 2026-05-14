import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Tarea, EstadoTarea } from '../../tipos';
import TarjetaTarea from '../TarjetaTarea/TarjetaTarea';
import './ColumnaTablero.css';

const TITULOS: Record<EstadoTarea, string> = {
  por_hacer: 'Por hacer',
  en_proceso: 'En proceso',
  finalizada: 'Finalizadas',
};

interface Props {
  estado: EstadoTarea;
  tareas: Tarea[];
  onClickTarea?: (tarea: Tarea) => void;
  onEliminarTarea?: (tarea: Tarea) => void;
}

export default function ColumnaTablero({ estado, tareas, onClickTarea, onEliminarTarea }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });

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
          {tareas.map((tarea) => (
            <TarjetaTarea key={tarea.id} tarea={tarea} onClick={() => onClickTarea?.(tarea)} onEliminar={onEliminarTarea ? () => onEliminarTarea(tarea) : undefined} />
          ))}
        </SortableContext>
        {tareas.length === 0 && (
          <div className="columna-tablero__vacia">Sin tareas</div>
        )}
      </div>
    </div>
  );
}
