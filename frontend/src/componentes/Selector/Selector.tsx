import { useState, useEffect, useRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import './Selector.css';

interface Opcion {
  valor: string | number;
  etiqueta: string;
}

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  etiqueta?: string;
  opciones: Opcion[];
  error?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Selector({ etiqueta, opciones, error, id, className = '', value, onChange, disabled, ...resto }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [textoFiltro, setTextoFiltro] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Encontrar opción seleccionada o usar la primera como fallback
  const opcionSeleccionada = opciones.find(op => String(op.valor) === String(value)) || opciones[0];
  const labelSeleccionado = opcionSeleccionada ? opcionSeleccionada.etiqueta : (opciones[0]?.etiqueta || '');

  // Filtrar opciones por búsqueda (ignora mayúsculas/minúsculas)
  const opcionesFiltradas = opciones.filter(op =>
    op.etiqueta.toLowerCase().includes(textoFiltro.toLowerCase())
  );

  // Cerrar el menú al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTextoFiltro('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Resetear el índice activo al escribir en el filtro de búsqueda
  useEffect(() => {
    setActiveIndex(0);
  }, [textoFiltro]);

  const seleccionarOpcion = (opcion: Opcion) => {
    if (disabled) return;
    
    // Crear un mock del evento nativo para asegurar compatibilidad total
    const mockEvent = {
      target: {
        value: String(opcion.valor),
        name: resto.name || '',
        id: id || ''
      }
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange?.(mockEvent);
    setIsOpen(false);
    setTextoFiltro('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setTextoFiltro('');
        inputRef.current?.blur();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (opcionesFiltradas.length > 0 ? (prev + 1) % opcionesFiltradas.length : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (opcionesFiltradas.length > 0 ? (prev - 1 + opcionesFiltradas.length) % opcionesFiltradas.length : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (opcionesFiltradas.length > 0) {
          seleccionarOpcion(opcionesFiltradas[activeIndex]);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setTextoFiltro('');
        break;
    }
  };

  // El valor del input dependerá de si el dropdown está abierto y el usuario está buscando
  const valorInputVisible = isOpen ? textoFiltro : labelSeleccionado;
  // El placeholder cuando está abierto será la opción seleccionada actual (estilo atenuado)
  const placeholderInputVisible = isOpen ? labelSeleccionado : '';

  return (
    <div className={`selector ${className}`} ref={containerRef}>
      {etiqueta && <label className="selector__etiqueta" htmlFor={id}>{etiqueta}</label>}
      
      {/* Selector invisible para compatibilidad nativa con HTML5 (validación required) y herramientas de testing */}
      <select
        {...resto}
        id={id}
        value={value}
        disabled={disabled}
        onChange={onChange}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: '0',
          pointerEvents: 'none'
        }}
      >
        {opciones.map((op) => (
          <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
        ))}
      </select>

      {/* Input de texto visible / gatillo del dropdown */}
      <div className="selector__control-wrapper">
        <input
          ref={inputRef}
          type="text"
          id={id ? `${id}-visible` : undefined}
          disabled={disabled}
          value={valorInputVisible}
          placeholder={placeholderInputVisible}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true);
            setTextoFiltro(e.target.value);
          }}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              setTextoFiltro('');
            }
          }}
          onKeyDown={handleKeyDown}
          className={`selector__control ${error ? 'selector__control--error' : ''} ${disabled ? 'selector__control--disabled' : ''} ${isOpen ? 'selector__control--open' : ''}`}
          style={{
            cursor: isOpen ? 'text' : 'pointer'
          }}
        />
        {/* Indicador visual de dropdown (flecha con animación de rotación) */}
        <span className={`selector__arrow ${isOpen ? 'selector__arrow--open' : ''}`} />
      </div>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="selector__dropdown animate-scale-in">
          <ul className="selector__options-list">
            {opcionesFiltradas.length > 0 ? (
              opcionesFiltradas.map((op, idx) => {
                const esActivo = idx === activeIndex;
                const esSeleccionado = String(op.valor) === String(value);
                return (
                  <li
                    key={op.valor}
                    onClick={(e) => {
                      e.stopPropagation();
                      seleccionarOpcion(op);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`selector__option ${esActivo ? 'selector__option--active' : ''} ${esSeleccionado ? 'selector__option--selected' : ''}`}
                  >
                    {op.etiqueta}
                  </li>
                );
              })
            ) : (
              <li className="selector__no-results">No se encontraron opciones</li>
            )}
          </ul>
        </div>
      )}

      {error && <span className="selector__error">{error}</span>}
    </div>
  );
}
