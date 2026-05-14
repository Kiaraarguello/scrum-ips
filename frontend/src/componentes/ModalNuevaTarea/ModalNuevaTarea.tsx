import { useState, useEffect } from 'react';
import type { Sector, Sede } from '../../tipos';
import { listarSectores } from '../../servicios/sectores';
import { listarSedes } from '../../servicios/sedes';
import { crearTarea } from '../../servicios/tareas';
import CampoTexto from '../CampoTexto/CampoTexto';
import Selector from '../Selector/Selector';
import Boton from '../Boton/Boton';
import './ModalNuevaTarea.css';

interface Props {
  onCerrar: () => void;
  onCreada: () => void;
  proyectoId?: number;
}

export default function ModalNuevaTarea({ onCerrar, onCreada, proyectoId }: Props) {
  const [titulo, setTitulo] = useState('');
  const [nota, setNota] = useState('');
  const [criticidad, setCriticidad] = useState('baja');
  const [sectorId, setSectorId] = useState('');
  const [sedeId, setSedeId] = useState('');
  const [contacto, setContacto] = useState('');
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listarSectores().then(setSectores);
    listarSedes().then(setSedes);
  }, []);

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !sectorId || !sedeId) {
      setError('Titulo, sector y sede son obligatorios');
      return;
    }
    setEnviando(true);
    try {
      await crearTarea({
        titulo: titulo.trim(),
        nota_llamada: nota.trim() || undefined,
        criticidad: criticidad as 'alta' | 'media' | 'baja',
        sector_id: Number(sectorId),
        sede_id: Number(sedeId),
        numero_contacto: contacto.trim() || undefined,
        proyecto_id: proyectoId,
      });
      onCreada();
    } catch {
      setError('Error al crear la tarea');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-nueva-tarea__fondo" onClick={onCerrar}>
      <div className="modal-nueva-tarea__caja" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-nueva-tarea__titulo">Nueva tarea</h2>
        <form onSubmit={manejarEnvio} className="modal-nueva-tarea__formulario">
          <CampoTexto etiqueta="Titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} id="titulo-tarea" />
          <div className="modal-nueva-tarea__fila">
            <Selector
              etiqueta="Sector"
              id="sector-tarea"
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              opciones={[
                { valor: '', etiqueta: 'Seleccionar sector' },
                ...sectores.filter((s) => s.activo).map((s) => ({ valor: s.id, etiqueta: s.nombre })),
              ]}
            />
            <Selector
              etiqueta="Sede"
              id="sede-tarea"
              value={sedeId}
              onChange={(e) => setSedeId(e.target.value)}
              opciones={[
                { valor: '', etiqueta: 'Seleccionar sede' },
                ...sedes.filter((s) => s.activo).map((s) => ({ valor: s.id, etiqueta: s.nombre })),
              ]}
            />
          </div>
          <div className="modal-nueva-tarea__fila">
            <Selector
              etiqueta="Criticidad"
              id="criticidad-tarea"
              value={criticidad}
              onChange={(e) => setCriticidad(e.target.value)}
              opciones={[
                { valor: 'baja', etiqueta: 'Baja' },
                { valor: 'media', etiqueta: 'Media' },
                { valor: 'alta', etiqueta: 'Alta' },
              ]}
            />
            <CampoTexto
              etiqueta="Contacto (opcional)"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              id="contacto-tarea"
              placeholder="Numero o nombre"
            />
          </div>
          <div className="modal-nueva-tarea__nota-campo">
            <label className="campo-texto__etiqueta" htmlFor="nota-tarea">Nota de llamada (opcional)</label>
            <textarea
              id="nota-tarea"
              className="modal-nueva-tarea__textarea"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              placeholder="Detalle de la consulta..."
            />
          </div>
          {error && <p className="modal-nueva-tarea__error">{error}</p>}
          <div className="modal-nueva-tarea__acciones">
            <Boton type="button" variante="secundario" onClick={onCerrar}>Cancelar</Boton>
            <Boton type="submit" disabled={enviando}>{enviando ? 'Guardando...' : 'Crear tarea'}</Boton>
          </div>
        </form>
      </div>
    </div>
  );
}
