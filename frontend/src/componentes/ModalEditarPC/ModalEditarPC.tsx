import React, { useState, useEffect } from 'react';
import type { PcRegistro, Sede } from '../../tipos';
import { listarSedes } from '../../servicios/sedes';
import { actualizarPc } from '../../servicios/pcs';
import CampoTexto from '../CampoTexto/CampoTexto';
import Selector from '../Selector/Selector';
import Boton from '../Boton/Boton';
import './ModalEditarPC.css';

interface Props {
  pc: PcRegistro;
  onCerrar: () => void;
  onActualizada: () => void;
}

export default function ModalEditarPC({ pc, onCerrar, onActualizada }: Props) {
  const [nombreInterno, setNombreInterno] = useState(pc.nombre_interno);
  const [propietario, setPropietario] = useState(pc.propietario ?? '');
  const [descripcion, setDescripcion] = useState(pc.descripcion ?? '');
  const [ciudad, setCiudad] = useState(pc.ciudad ?? '');
  const [sedeId, setSedeId] = useState(pc.sede_id ? pc.sede_id.toString() : '');
  const [estado, setEstado] = useState(pc.estado);
  const [notas, setNotas] = useState(pc.notas ?? '');

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listarSedes().then(setSedes).catch(() => {});
  }, []);

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!nombreInterno.trim()) {
      setError('El nombre interno es obligatorio');
      return;
    }

    setEnviando(true);
    try {
      // Calcular fecha_salida automáticamente según el estado seleccionado
      let fechaSalidaPayload: string | null = pc.fecha_salida;
      if (estado === 'entregada' && pc.estado !== 'entregada') {
        fechaSalidaPayload = new Date().toISOString();
      } else if (estado !== 'entregada') {
        fechaSalidaPayload = null;
      }

      await actualizarPc(pc.id, {
        nombre_interno: nombreInterno.trim(),
        propietario: propietario.trim() || null,
        descripcion: descripcion.trim() || null,
        ciudad: ciudad.trim() || null,
        sede_id: sedeId ? Number(sedeId) : null,
        estado: estado,
        fecha_salida: fechaSalidaPayload,
        notas: notas.trim() || null,
      });

      onActualizada();
    } catch (err) {
      console.error(err);
      setError('Error al actualizar los datos de la PC.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-editar-pc__fondo animate-fade-in" onClick={onCerrar}>
      <div className="modal-editar-pc__caja" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-editar-pc__titulo">Editar Registro de PC</h2>
        
        <form onSubmit={manejarEnvio} className="modal-editar-pc__formulario">
          
          <div className="modal-editar-pc__fila">
            <CampoTexto 
              etiqueta="Nombre interno" 
              value={nombreInterno} 
              onChange={(e) => setNombreInterno(e.target.value)} 
              id="edit-nom-pc" 
              required
            />
            <CampoTexto 
              etiqueta="Propietario" 
              value={propietario} 
              onChange={(e) => setPropietario(e.target.value)} 
              id="edit-prop-pc"
            />
          </div>

          <div className="modal-editar-pc__campo-completo">
            <label className="campo-texto__etiqueta" htmlFor="edit-desc-pc">Descripción / problema</label>
            <textarea
              id="edit-desc-pc"
              className="modal-editar-pc__textarea"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              placeholder="Detalle del desperfecto..."
            />
          </div>

          <div className="modal-editar-pc__fila">
            <CampoTexto 
              etiqueta="Ciudad" 
              value={ciudad} 
              onChange={(e) => setCiudad(e.target.value)} 
              id="edit-ciu-pc"
            />
            <Selector
              etiqueta="Sede"
              id="edit-sede-pc"
              value={sedeId}
              onChange={(e) => setSedeId(e.target.value)}
              opciones={[
                { valor: '', etiqueta: 'Sin sede' },
                ...sedes.filter(s => s.activo || s.id === pc.sede_id).map(s => ({ valor: s.id, etiqueta: s.nombre }))
              ]}
            />
          </div>

          <div className="modal-editar-pc__fila">
            <Selector
              etiqueta="Estado de la PC"
              id="edit-estado-pc"
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
              opciones={[
                { valor: 'llegada', etiqueta: 'Llegada' },
                { valor: 'en_proceso', etiqueta: 'En proceso' },
                { valor: 'para_entregar', etiqueta: 'Listo para entregar' },
                { valor: 'entregada', etiqueta: 'Entregada' }
              ]}
              required
            />
          </div>

          <div className="modal-editar-pc__campo-completo">
            <label className="campo-texto__etiqueta" htmlFor="edit-not-pc">Notas internas</label>
            <textarea
              id="edit-not-pc"
              className="modal-editar-pc__textarea"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              placeholder="Notas de auditoría..."
            />
          </div>

          {error && <p className="modal-editar-pc__error">{error}</p>}

          <div className="modal-editar-pc__acciones">
            <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
            <Boton type="submit" disabled={enviando}>
              {enviando ? 'Guardando...' : 'Guardar Cambios'}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}
