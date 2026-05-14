import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './CampoTexto.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  error?: string;
}

export default function CampoTexto({ etiqueta, error, id, className = '', type, ...resto }: Props) {
  const [visible, setVisible] = useState(false);
  const esPassword = type === 'password';

  return (
    <div className={`campo-texto ${className}`}>
      {etiqueta && <label className="campo-texto__etiqueta" htmlFor={id}>{etiqueta}</label>}
      <div className={`campo-texto__envoltorio${esPassword ? ' campo-texto__envoltorio--password' : ''}`}>
        <input
          id={id}
          type={esPassword ? (visible ? 'text' : 'password') : type}
          className={`campo-texto__input ${error ? 'campo-texto__input--error' : ''}`}
          {...resto}
        />
        {esPassword && (
          <button
            type="button"
            className="campo-texto__ojo"
            onClick={() => setVisible(v => !v)}
            tabIndex={-1}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="campo-texto__error">{error}</span>}
    </div>
  );
}
