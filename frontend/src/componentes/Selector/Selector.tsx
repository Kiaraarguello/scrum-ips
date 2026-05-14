import type { SelectHTMLAttributes } from 'react';
import './Selector.css';

interface Opcion {
  valor: string | number;
  etiqueta: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta?: string;
  opciones: Opcion[];
  error?: string;
}

export default function Selector({ etiqueta, opciones, error, id, className = '', ...resto }: Props) {
  return (
    <div className={`selector ${className}`}>
      {etiqueta && <label className="selector__etiqueta" htmlFor={id}>{etiqueta}</label>}
      <select id={id} className={`selector__control ${error ? 'selector__control--error' : ''}`} {...resto}>
        {opciones.map((op) => (
          <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
        ))}
      </select>
      {error && <span className="selector__error">{error}</span>}
    </div>
  );
}
