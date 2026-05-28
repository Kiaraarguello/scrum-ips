import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Phone, Layers, Trash2 } from 'lucide-react';
import type { Tarea } from '../../tipos';
import BadgeCriticidad from '../BadgeCriticidad/BadgeCriticidad';
import { formatearFechaHora } from '../../utilidades/formatoFecha';
import './TarjetaTarea.css';

interface Props {
  tarea: Tarea;
  onClick?: () => void;
  onEliminar?: () => void;
  esMia?: boolean;
}

export default function TarjetaTarea({ tarea, onClick, onEliminar, esMia }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tarea.id,
  });

  const estilo = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      className={`tarjeta-tarea ${esMia ? 'tarjeta-tarea--mia' : ''}`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="tarjeta-tarea__cabecera">
        <div className="tarjeta-tarea__cabecera-izquierda">
          <span className="tarjeta-tarea__id-badge">#{tarea.id}</span>
          <BadgeCriticidad criticidad={tarea.criticidad} />
          {tarea.asignados && tarea.asignados.length > 0 && (
            <span 
              className="tarjeta-tarea__usuario-badge"
              title={tarea.asignados.map(u => `${u.nombre} ${u.apellido}`).join(', ')}
            >
              {tarea.asignados.map(u => u.nombre).join(', ')}
            </span>
          )}
        </div>
        <div className="tarjeta-tarea__cabecera-derecha">
          <span className="tarjeta-tarea__fecha">{formatearFechaHora(tarea.fecha_creacion)}</span>
          {onEliminar && (
            <button
              className="tarjeta-tarea__btn-eliminar"
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onEliminar(); }}
              title="Archivar tarea"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <h3 className="tarjeta-tarea__titulo">{tarea.titulo}</h3>
      <div className="tarjeta-tarea__pie">
        {tarea.sede && (
          <span className="tarjeta-tarea__meta">
            <MapPin size={11} />
            {tarea.sede.nombre}
          </span>
        )}
        {tarea.sector && (
          <span className="tarjeta-tarea__meta">
            <Layers size={11} />
            {tarea.sector.nombre}
          </span>
        )}
        {tarea.numero_contacto && (
          <span className="tarjeta-tarea__meta">
            <Phone size={11} />
            {tarea.numero_contacto}
          </span>
        )}
      </div>
    </div>
  );
}
