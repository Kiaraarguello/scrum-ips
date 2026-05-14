import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Phone, User, Layers, Trash2 } from 'lucide-react';
import type { Tarea } from '../../tipos';
import BadgeCriticidad from '../BadgeCriticidad/BadgeCriticidad';
import { formatearFechaHora } from '../../utilidades/formatoFecha';
import './TarjetaTarea.css';

interface Props {
  tarea: Tarea;
  onClick?: () => void;
  onEliminar?: () => void;
}

export default function TarjetaTarea({ tarea, onClick, onEliminar }: Props) {
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
      className="tarjeta-tarea"
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="tarjeta-tarea__cabecera">
        <BadgeCriticidad criticidad={tarea.criticidad} />
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
      {tarea.nota_llamada && (
        <p className="tarjeta-tarea__nota">{tarea.nota_llamada}</p>
      )}
      <div className="tarjeta-tarea__pie">
        {tarea.sede && (
          <span className="tarjeta-tarea__meta">
            <MapPin size={12} />
            {tarea.sede.nombre}
          </span>
        )}
        {tarea.sector && (
          <span className="tarjeta-tarea__meta">
            <Layers size={12} />
            {tarea.sector.nombre}
          </span>
        )}
        {tarea.numero_contacto && (
          <span className="tarjeta-tarea__meta">
            <Phone size={12} />
            {tarea.numero_contacto}
          </span>
        )}
        {tarea.asignado && (
          <span className="tarjeta-tarea__meta tarjeta-tarea__meta--asignado">
            <User size={12} />
            {tarea.asignado.nombre}
          </span>
        )}
      </div>
    </div>
  );
}
