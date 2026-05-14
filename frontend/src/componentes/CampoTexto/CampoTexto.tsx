import type { InputHTMLAttributes } from 'react';
import './CampoTexto.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
}

export default function CampoTexto({ etiqueta, error, id, className = '', ...resto }: Props) {
  return (
    <div className={`campo-texto ${className}`}>
      {etiqueta && <label className="campo-texto__etiqueta" htmlFor={id}>{etiqueta}</label>}
      <input id={id} className={`campo-texto__input ${error ? 'campo-texto__input--error' : ''}`} {...resto} />
      {error && <span className="campo-texto__error">{error}</span>}
    </div>
  );
}
