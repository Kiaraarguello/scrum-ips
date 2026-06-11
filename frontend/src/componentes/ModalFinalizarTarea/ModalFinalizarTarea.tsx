import React, { useState } from 'react';
import type { Tarea } from '../../tipos';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Boton from '../Boton/Boton';
import './ModalFinalizarTarea.css';

interface Props {
  tarea: Tarea;
  modoInicial?: 'finalizada' | 'pendiente';
  onCerrar: () => void;
  onConfirmar: (nuevoEstado: 'finalizada' | 'pendiente', texto: string) => Promise<void>;
}

export default function ModalFinalizarTarea({ tarea, modoInicial = 'finalizada', onCerrar, onConfirmar }: Props) {
  const [esPendiente, setEsPendiente] = useState(modoInicial === 'pendiente');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const textoLimpio = descripcion.trim();
    if (!textoLimpio) {
      setError(
        esPendiente
          ? 'Por favor, describe brevemente por qué la tarea queda pendiente.'
          : 'Por favor, describe brevemente cuál fue la solución al problema.'
      );
      return;
    }

    setEnviando(true);
    try {
      const nuevoEstado = esPendiente ? 'pendiente' : 'finalizada';
      await onConfirmar(nuevoEstado, textoLimpio);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Ocurrió un error al procesar la tarea. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-finalizar-tarea__fondo animate-fade-in" onClick={onCerrar}>
      <div className="modal-finalizar-tarea__caja" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-finalizar-tarea__cabecera">
          <div className={`modal-finalizar-tarea__icono-estado ${
            esPendiente 
              ? 'modal-finalizar-tarea__icono-estado--pendiente' 
              : 'modal-finalizar-tarea__icono-estado--finalizar'
          }`}>
            {esPendiente ? <Clock size={22} /> : <CheckCircle size={22} />}
          </div>
          <h2 className="modal-finalizar-tarea__titulo">
            {esPendiente ? 'Registrar como Pendiente' : 'Finalizar Tarea'}
          </h2>
        </div>

        <span className="modal-finalizar-tarea__tarea-titulo">
          Tarea: {tarea.titulo}
        </span>

        <form onSubmit={manejarEnvio} className="modal-finalizar-tarea__formulario">
          
          {/* iOS Toggle Switch */}
          <div 
            className="modal-finalizar-tarea__toggle-container"
            onClick={() => setEsPendiente(!esPendiente)}
          >
            <div className="modal-finalizar-tarea__toggle-info">
              <span className="modal-finalizar-tarea__toggle-titulo">
                ¿Dejar como Pendiente?
              </span>
              <span className="modal-finalizar-tarea__toggle-desc">
                Pendiente de compras, repuestos o terceros.
              </span>
            </div>
            <label className="modal-finalizar-tarea__switch" onClick={(e) => e.stopPropagation()}>
              <input 
                type="checkbox" 
                checked={esPendiente} 
                onChange={(e) => setEsPendiente(e.target.checked)}
              />
              <span className="modal-finalizar-tarea__slider"></span>
            </label>
          </div>

          {/* Description Field */}
          <div className="modal-finalizar-tarea__nota-campo">
            <label className="campo-texto__etiqueta" htmlFor="finalizar-descripcion">
              {esPendiente 
                ? '¿Por qué queda pendiente? (Tercero, compra, etc.)' 
                : 'Descripción de la solución al problema'
              }
            </label>
            <textarea
              id="finalizar-descripcion"
              className="modal-finalizar-tarea__textarea"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              placeholder={
                esPendiente
                  ? 'Ej: Esperando que el proveedor envíe el repuesto del disco rígido...'
                  : 'Ej: Se formateó el sistema operativo y se reinstalaron los programas institucionales...'
              }
              required
            />
          </div>

          {error && (
            <p className="modal-finalizar-tarea__error">
              <AlertTriangle size={14} />
              {error}
            </p>
          )}

          <div className="modal-finalizar-tarea__acciones">
            <Boton type="button" variante="secundario" onClick={onCerrar} disabled={enviando}>
              Cancelar
            </Boton>
            <Boton 
              type="submit" 
              variante={esPendiente ? 'primario' : 'primario'} 
              style={!esPendiente ? { backgroundColor: 'var(--verde-suave)', borderColor: 'var(--verde-suave)' } : undefined}
              disabled={enviando}
            >
              {enviando 
                ? 'Procesando...' 
                : (esPendiente ? 'Dejar en Pendientes' : 'Finalizar Tarea')
              }
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}
