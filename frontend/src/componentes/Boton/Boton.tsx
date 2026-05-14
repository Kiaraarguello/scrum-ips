import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Boton.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro' | 'fantasma';
  children: ReactNode;
}

export default function Boton({ variante = 'primario', className = '', children, ...resto }: Props) {
  return (
    <button className={`boton boton--${variante} ${className}`} {...resto}>
      {children}
    </button>
  );
}
