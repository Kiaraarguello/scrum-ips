import type { Criticidad } from '../../tipos';
import './BadgeCriticidad.css';

const ETIQUETAS: Record<Criticidad, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export default function BadgeCriticidad({ criticidad }: { criticidad: Criticidad }) {
  return (
    <span className={`badge-criticidad badge-criticidad--${criticidad}`}>
      {ETIQUETAS[criticidad]}
    </span>
  );
}
