import { useState, useEffect } from 'react';
import type { Sector, Sede, Usuario } from '../../tipos';
import { listarSectores } from '../../servicios/sectores';
import { listarSedes } from '../../servicios/sedes';
import { crearTarea } from '../../servicios/tareas';
import { listarUsuarios } from '../../servicios/usuarios';
import { useAuth } from '../../contextos/ContextoAuth';
import { Check } from 'lucide-react';
import CampoTexto from '../CampoTexto/CampoTexto';
import Selector from '../Selector/Selector';
import Boton from '../Boton/Boton';
import './ModalNuevaTarea.css';
import '../ModalAsignarUsuario/ModalAsignarUsuario.css';

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
  const [usuariosAsignables, setUsuariosAsignables] = useState<Usuario[]>([]);
  const [usuarioIdsAsignados, setUsuarioIdsAsignados] = useState<number[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const { usuario: usuarioLogueado } = useAuth();

  useEffect(() => {
    listarSectores().then(setSectores);
    listarSedes().then(setSedes);
  }, []);

  useEffect(() => {
    if (!sectorId) {
      setUsuariosAsignables([]);
      setUsuarioIdsAsignados([]);
      return;
    }
    const numSectorId = Number(sectorId);
    listarUsuarios().then((lista) => {
      const filtrados = lista.filter((u) => 
        ((
          u.sector_id === numSectorId || 
          u.ver_todos || 
          u.sectores?.some((s) => s.id === numSectorId) ||
          u.sector?.nombre?.toLowerCase() === 'todos los sectores' ||
          u.sectores?.some((s) => s.nombre?.toLowerCase() === 'todos los sectores')
        ) && u.activo)
      );

      // Ordenar por: 1. Sesión activa, 2. rol 'usuario', 3. rol 'admin', 4. alfabético
      const ordenados = [...filtrados].sort((a, b) => {
        const idActual = usuarioLogueado?.id;
        if (a.id === idActual && b.id !== idActual) return -1;
        if (b.id === idActual && a.id !== idActual) return 1;
        if (a.rol === 'usuario' && b.rol === 'admin') return -1;
        if (a.rol === 'admin' && b.rol === 'usuario') return 1;
        const nombreA = `${a.nombre} ${a.apellido}`.toLowerCase();
        const nombreB = `${b.nombre} ${b.apellido}`.toLowerCase();
        return nombreA.localeCompare(nombreB);
      });
      setUsuariosAsignables(ordenados);
    });
  }, [sectorId, usuarioLogueado]);

  const obtenerColorAvatar = (texto: string) => {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      hash = texto.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 42%)`;
  };

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    setEnviando(true);
    try {
      await crearTarea({
        titulo: titulo.trim(),
        nota_llamada: nota.trim() || undefined,
        criticidad: criticidad as 'alta' | 'media' | 'baja',
        sector_id: sectorId ? Number(sectorId) : undefined,
        sede_id: sedeId ? Number(sedeId) : undefined,
        numero_contacto: contacto.trim() || undefined,
        proyecto_id: proyectoId,
        asignado_ids: usuarioIdsAsignados,
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
                ...sectores.filter((s) => s.activo && s.nombre.toLowerCase() !== 'todos los sectores').map((s) => ({ valor: s.id, etiqueta: s.nombre })),
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
              rows={2}
              placeholder="Detalle de la consulta..."
            />
          </div>
          {sectorId && (
            <div className="modal-nueva-tarea__nota-campo" style={{ gap: '8px' }}>
              <label className="campo-texto__etiqueta">Asignar Equipo (opcional)</label>
              {usuariosAsignables.length === 0 ? (
                <p className="modal-asignar__vacio">No hay usuarios disponibles en este sector.</p>
              ) : (
                <div className="modal-asignar__lista" style={{ maxHeight: '120px' }}>
                  {usuariosAsignables.map((u) => {
                    const estaSeleccionado = usuarioIdsAsignados.includes(u.id);
                    const initials = `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase();
                    const avatarColor = obtenerColorAvatar(u.nombre + u.apellido);
                    return (
                      <div
                        key={u.id}
                        className={`modal-asignar__item ${estaSeleccionado ? 'modal-asignar__item--seleccionado' : ''}`}
                        onClick={() => {
                          setUsuarioIdsAsignados(prev =>
                            prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                          );
                        }}
                      >
                        <div className="modal-asignar__avatar" style={{ backgroundColor: avatarColor }}>
                          {initials}
                        </div>
                        <div className="modal-asignar__info">
                          <span className="modal-asignar__nombre">{u.nombre} {u.apellido}</span>
                          {((usuarioLogueado?.rol === 'admin') || (u.id === usuarioLogueado?.id)) ? (
                            <span className="modal-asignar__email">{u.email}</span>
                          ) : (
                            <span className="modal-asignar__email">
                              {u.ver_todos ? 'Todos los sectores' : u.sector?.nombre || 'Sin sector'}
                            </span>
                          )}
                        </div>
                        <div className={`modal-asignar__checkbox-custom ${estaSeleccionado ? 'modal-asignar__checkbox-custom--activo' : ''}`}>
                          {estaSeleccionado && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
