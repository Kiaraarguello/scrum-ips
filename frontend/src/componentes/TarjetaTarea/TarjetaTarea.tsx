import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Phone, Layers, Trash2, ListTodo, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import type { Tarea, EstadoTarea } from '../../tipos';
import BadgeCriticidad from '../BadgeCriticidad/BadgeCriticidad';
import { formatearFechaHora } from '../../utilidades/formatoFecha';
import './TarjetaTarea.css';

interface Props {
  tarea: Tarea;
  onClick?: () => void;
  onEliminar?: () => void;
  onCambiarEstado?: (nuevoEstado: EstadoTarea) => void;
  puedeMover?: boolean;
  puedeFinalizar?: boolean;
  esMia?: boolean;
}

export default function TarjetaTarea({
  tarea,
  onClick,
  onEliminar,
  onCambiarEstado,
  puedeMover = false,
  puedeFinalizar = false,
  esMia,
}: Props) {
  const puedeArrastrar = puedeMover || puedeFinalizar;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tarea.id,
    disabled: !puedeArrastrar,
  });

  const estilo = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : undefined,
    position: 'relative' as const,
  };

  const mostrarAcciones = onCambiarEstado && (puedeMover || puedeFinalizar);
  const estado = tarea.estado;

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      data-tarea-id={tarea.id}
      className={`tarjeta-tarea ${esMia ? 'tarjeta-tarea--mia' : ''} ${isDragging ? 'tarjeta-tarea--arrastrando' : ''} ${puedeArrastrar ? 'tarjeta-tarea--arrastrable' : ''}`}
    >
      <div
        className="tarjeta-tarea__zona-arrastre"
        onClick={onClick}
        {...(puedeArrastrar ? attributes : {})}
        {...(puedeArrastrar ? listeners : {})}
      >
        <div className="tarjeta-tarea__cabecera">
          <div className="tarjeta-tarea__cabecera-izquierda">
            <span className="tarjeta-tarea__id-badge">#{tarea.id}</span>
            <BadgeCriticidad criticidad={tarea.criticidad} />
            {tarea.asignados && tarea.asignados.length > 0 && (
              <span
                className="tarjeta-tarea__usuario-badge"
                title={tarea.asignados.map((u) => `${u.nombre} ${u.apellido}`).join(', ')}
              >
                {tarea.asignados.map((u) => u.nombre).join(', ')}
              </span>
            )}
          </div>
          <div className="tarjeta-tarea__cabecera-derecha">
            <span className="tarjeta-tarea__fecha">{formatearFechaHora(tarea.fecha_creacion)}</span>
            {onEliminar && (
              <button
                type="button"
                className="tarjeta-tarea__btn-eliminar"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onEliminar();
                }}
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

      {mostrarAcciones && (
        <div className="tarjeta-tarea__acciones">
          {puedeMover && estado !== 'por_hacer' && (
            <button
              type="button"
              className="tarjeta-tarea__accion tarjeta-tarea__accion--por-hacer"
              title="Mover a Por hacer"
              onClick={() => onCambiarEstado('por_hacer')}
            >
              <ListTodo size={14} />
              <span>Por hacer</span>
            </button>
          )}
          {puedeMover && estado !== 'en_proceso' && (
            <button
              type="button"
              className="tarjeta-tarea__accion tarjeta-tarea__accion--proceso"
              title="Mover a En proceso"
              onClick={() => onCambiarEstado('en_proceso')}
            >
              <PlayCircle size={14} />
              <span>En proceso</span>
            </button>
          )}
          {puedeFinalizar && estado !== 'finalizada' && (
            <button
              type="button"
              className="tarjeta-tarea__accion tarjeta-tarea__accion--finalizar"
              title="Finalizar tarea"
              onClick={() => onCambiarEstado('finalizada')}
            >
              <CheckCircle size={14} />
              <span>Finalizar</span>
            </button>
          )}
          {puedeFinalizar && estado !== 'pendiente' && (
            <button
              type="button"
              className="tarjeta-tarea__accion tarjeta-tarea__accion--pendiente"
              title="Dejar como pendiente (repuestos, terceros, etc.)"
              onClick={() => onCambiarEstado('pendiente')}
            >
              <Clock size={14} />
              <span>Pendiente</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
