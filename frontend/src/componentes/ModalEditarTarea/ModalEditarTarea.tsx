import { useState, useEffect } from 'react';
import type { Tarea, Sector, Sede, Usuario, HistorialMovimiento } from '../../tipos';
import { listarSectores } from '../../servicios/sectores';
import { listarSedes } from '../../servicios/sedes';
import { actualizarTarea, obtenerHistorialTarea } from '../../servicios/tareas';
import { listarUsuarios } from '../../servicios/usuarios';
import { useAuth } from '../../contextos/ContextoAuth';
import { Check, Edit, X, Phone, MapPin, Layers, AlertCircle, CheckCircle2, History, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
import CampoTexto from '../CampoTexto/CampoTexto';
import Selector from '../Selector/Selector';
import Boton from '../Boton/Boton';
import BadgeCriticidad from '../BadgeCriticidad/BadgeCriticidad';
import { formatearFechaHora } from '../../utilidades/formatoFecha';
import './ModalEditarTarea.css';
import '../ModalAsignarUsuario/ModalAsignarUsuario.css';

interface Props {
  tarea: Tarea;
  onCerrar: () => void;
  onActualizada: () => void;
}

const ESTADOS_MAP: Record<string, { label: string, clase: string }> = {
  por_hacer: { label: 'Por hacer', clase: 'modal-editar-tarea__estado-badge--por-hacer' },
  en_proceso: { label: 'En proceso', clase: 'modal-editar-tarea__estado-badge--en-proceso' },
  finalizada: { label: 'Finalizada', clase: 'modal-editar-tarea__estado-badge--finalizada' },
  pendiente: { label: 'Pendiente', clase: 'modal-editar-tarea__estado-badge--pendiente' },
};

export default function ModalEditarTarea({ tarea, onCerrar, onActualizada }: Props) {
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const [titulo, setTitulo] = useState(tarea.titulo);
  const [nota, setNota] = useState(tarea.nota_llamada ?? '');
  const [criticidad, setCriticidad] = useState(tarea.criticidad);
  const [sectorId, setSectorId] = useState(tarea.sector_id.toString());
  const [sedeId, setSedeId] = useState(tarea.sede_id.toString());
  const [contacto, setContacto] = useState(tarea.numero_contacto ?? '');
  
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [usuariosAsignables, setUsuariosAsignables] = useState<Usuario[]>([]);
  const [usuarioIdsAsignados, setUsuarioIdsAsignados] = useState<number[]>(
    tarea.asignados?.map((u) => u.id) ?? []
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const { usuario: usuarioLogueado } = useAuth();

  const [historial, setHistorial] = useState<HistorialMovimiento[]>([]);
  const [historialAbierto, setHistorialAbierto] = useState(false);

  useEffect(() => {
    listarSectores().then(setSectores);
    listarSedes().then(setSedes);
    
    obtenerHistorialTarea(tarea.id)
      .then(setHistorial)
      .catch((err) => console.error('Error al cargar historial:', err));
  }, [tarea.id]);

  useEffect(() => {
    if (!sectorId) {
      setUsuariosAsignables([]);
      return;
    }
    const numSectorId = Number(sectorId);
    listarUsuarios().then((lista) => {
      const filtrados = lista.filter((u) => 
        ((
          u.sector_id === numSectorId || 
          u.ver_todos || 
          u.rol === 'admin' ||
          u.sectores?.some((s) => s.id === numSectorId) ||
          u.sector?.nombre?.toLowerCase() === 'todos los sectores' ||
          u.sectores?.some((s) => s.nombre?.toLowerCase() === 'todos los sectores')
        ) && u.activo) ||
        (usuarioIdsAsignados.includes(u.id))
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

  const cancelarEdicion = () => {
    setTitulo(tarea.titulo);
    setNota(tarea.nota_llamada ?? '');
    setCriticidad(tarea.criticidad);
    setSectorId(tarea.sector_id.toString());
    setSedeId(tarea.sede_id.toString());
    setContacto(tarea.numero_contacto ?? '');
    setUsuarioIdsAsignados(tarea.asignados?.map((u) => u.id) ?? []);
    setError('');
    setModoEdicion(false);
  };

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    setEnviando(true);
    try {
      await actualizarTarea(tarea.id, {
        titulo: titulo.trim(),
        nota_llamada: nota.trim() || null,
        criticidad: criticidad,
        sector_id: Number(sectorId),
        sede_id: Number(sedeId),
        numero_contacto: contacto.trim() || null,
        asignado_ids: usuarioIdsAsignados,
      });
      onActualizada();
    } catch {
      setError('Error al actualizar la tarea');
    } finally {
      setEnviando(false);
    }
  }

  const estadoInfo = ESTADOS_MAP[tarea.estado] || { label: tarea.estado, clase: '' };

  return (
    <div className="modal-editar-tarea__fondo animate-fade-in" onClick={onCerrar}>
      <div className="modal-editar-tarea__caja modern-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera del modal */}
        <div className="modal-editar-tarea__cabecera-top">
          <div className="modal-editar-tarea__cabecera-info">
            <span className="modal-editar-tarea__id-tag">Tarea #{tarea.id}</span>
            <span className={`modal-editar-tarea__estado-badge ${estadoInfo.clase}`}>
              {estadoInfo.label}
            </span>
          </div>
          <button className="modal-editar-tarea__cerrar-btn" onClick={onCerrar} title="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        {!modoEdicion ? (
          /* MODO VISTA (Solo Lectura) */
          <div className="modal-editar-tarea__vista">
            <h2 className="modal-editar-tarea__vista-titulo">{tarea.titulo}</h2>
            
            {/* Tarjetas de Metadatos en grilla superior */}
            <div className="modal-editar-tarea__vista-tarjetas-grid">
              
              {/* Detalles Generales */}
              <div className="modal-editar-tarea__sidebar-card">
                <h3 className="modal-editar-tarea__sidebar-titulo">Detalles Generales</h3>
                
                <div className="modal-editar-tarea__sidebar-lista">
                  
                  <div className="modal-editar-tarea__sidebar-item">
                    <Layers size={15} className="modal-editar-tarea__sidebar-icono" />
                    <div>
                      <span className="modal-editar-tarea__sidebar-label">Sector</span>
                      <strong className="modal-editar-tarea__sidebar-valor">{tarea.sector?.nombre || 'No especificado'}</strong>
                    </div>
                  </div>

                  <div className="modal-editar-tarea__sidebar-item">
                    <MapPin size={15} className="modal-editar-tarea__sidebar-icono" />
                    <div>
                      <span className="modal-editar-tarea__sidebar-label">Sede</span>
                      <strong className="modal-editar-tarea__sidebar-valor">{tarea.sede?.nombre || 'No especificado'}</strong>
                    </div>
                  </div>

                  <div className="modal-editar-tarea__sidebar-item">
                    <AlertCircle size={15} className="modal-editar-tarea__sidebar-icono" />
                    <div>
                      <span className="modal-editar-tarea__sidebar-label">Criticidad</span>
                      <div style={{ marginTop: '2px' }}>
                        <BadgeCriticidad criticidad={tarea.criticidad} />
                      </div>
                    </div>
                  </div>

                  <div className="modal-editar-tarea__sidebar-item">
                    <Phone size={15} className="modal-editar-tarea__sidebar-icono" />
                    <div>
                      <span className="modal-editar-tarea__sidebar-label">Contacto</span>
                      <strong className="modal-editar-tarea__sidebar-valor">{tarea.numero_contacto || 'Sin contacto registrado'}</strong>
                    </div>
                  </div>

                </div>
              </div>

              {/* Fechas y Registro */}
              <div className="modal-editar-tarea__sidebar-card modal-editar-tarea__sidebar-card--fechas">
                <h3 className="modal-editar-tarea__sidebar-titulo">Fechas y Registro</h3>
                
                <div className="modal-editar-tarea__sidebar-lista">
                  
                  {(() => {
                    if (tarea.nota_llamada && tarea.nota_llamada.startsWith('Contacto:')) {
                      const lineaContacto = tarea.nota_llamada.split('\n')[0];
                      const contactoNombre = lineaContacto.replace('Contacto:', '').trim();
                      return (
                        <div className="modal-editar-tarea__sidebar-item">
                          <User size={15} className="modal-editar-tarea__sidebar-icono" />
                          <div>
                            <span className="modal-editar-tarea__sidebar-label">Creado por</span>
                            <span className="modal-editar-tarea__sidebar-valor" style={{ whiteSpace: 'pre-line', lineHeight: '1.25' }}>
                              {`Sede: ${tarea.sede?.nombre || 'No especificada'}\n${contactoNombre}`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="modal-editar-tarea__sidebar-item">
                        <User size={15} className="modal-editar-tarea__sidebar-icono" />
                        <div>
                          <span className="modal-editar-tarea__sidebar-label">Creado por</span>
                          <span className="modal-editar-tarea__sidebar-valor">
                            {tarea.creador ? `${tarea.creador.nombre} ${tarea.creador.apellido}` : 'Sistema / Desconocido'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="modal-editar-tarea__sidebar-item">
                    <Calendar size={15} className="modal-editar-tarea__sidebar-icono" />
                    <div>
                      <span className="modal-editar-tarea__sidebar-label">Fecha Creación</span>
                      <span className="modal-editar-tarea__sidebar-valor">{formatearFechaHora(tarea.fecha_creacion)}</span>
                    </div>
                  </div>

                  <div className="modal-editar-tarea__sidebar-item">
                    <Calendar size={15} className="modal-editar-tarea__sidebar-icono" />
                    <div>
                      <span className="modal-editar-tarea__sidebar-label">Fecha Inicio</span>
                      <span className="modal-editar-tarea__sidebar-valor" style={{ fontSize: '0.8rem' }}>
                        {(() => {
                          const movimiento = historial.find(h => h.estado_nuevo === 'en_proceso');
                          if (movimiento) {
                            const usr = movimiento.usuario ? ` por ${movimiento.usuario.nombre} ${movimiento.usuario.apellido}` : '';
                            return `${formatearFechaHora(movimiento.fecha_movimiento)}${usr}`;
                          }
                          return 'No empezado';
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="modal-editar-tarea__sidebar-item">
                    <Calendar size={15} className="modal-editar-tarea__sidebar-icono" />
                    <div>
                      <span className="modal-editar-tarea__sidebar-label">Fecha Finalización</span>
                      <span className="modal-editar-tarea__sidebar-valor" style={{ fontSize: '0.8rem' }}>
                        {(() => {
                          if (tarea.estado !== 'finalizada') {
                            return 'No finalizada';
                          }
                          const movimiento = historial.find(h => h.estado_nuevo === 'finalizada');
                          if (movimiento) {
                            const usr = movimiento.usuario ? ` por ${movimiento.usuario.nombre} ${movimiento.usuario.apellido}` : '';
                            return `${formatearFechaHora(movimiento.fecha_movimiento)}${usr}`;
                          }
                          return 'No empezado';
                        })()}
                      </span>
                    </div>
                  </div>

                  <div className="modal-editar-tarea__sidebar-item">
                    <AlertCircle size={15} className="modal-editar-tarea__sidebar-icono" />
                    <div>
                      <span className="modal-editar-tarea__sidebar-label">Pendiente</span>
                      <span className="modal-editar-tarea__sidebar-valor" style={{ fontSize: '0.8rem' }}>
                        {(() => {
                          const indexEntrada = historial.findIndex(h => h.estado_nuevo === 'pendiente');
                          if (indexEntrada === -1) return 'No';
                          
                          const entrada = historial[indexEntrada];
                          const fechaEntradaStr = formatearFechaHora(entrada.fecha_movimiento);
                          
                          if (indexEntrada > 0) {
                            const salida = historial[indexEntrada - 1];
                            const fechaSalidaStr = formatearFechaHora(salida.fecha_movimiento);
                            return `Sí (De ${fechaEntradaStr} a ${fechaSalidaStr})`;
                          } else {
                            return `Actualmente (Desde ${fechaEntradaStr})`;
                          }
                        })()}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Botón y Sección de Historial Desplegable */}
            <div className="modal-editar-tarea__historial-contenedor" style={{ marginTop: '4px', width: '100%' }}>
              <button 
                type="button" 
                className="modal-editar-tarea__historial-toggle-btn"
                onClick={() => setHistorialAbierto(!historialAbierto)}
              >
                <History size={15} />
                <span>{historialAbierto ? 'Ocultar Historial' : 'Ver Historial de Cambios'}</span>
                {historialAbierto ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {historialAbierto && (
                <div className="modal-editar-tarea__historial-lista animate-slide-down">
                  {historial.length === 0 ? (
                    <p className="modal-editar-tarea__historial-vacio">No hay registros de movimientos para esta tarea.</p>
                  ) : (
                    <div className="modal-editar-tarea__historial-timeline">
                      {historial.map((mov) => {
                        const mapEstado = (est: string | null) => {
                          if (!est) return 'Creado';
                          const mapping: Record<string, string> = {
                            'por_hacer': 'Por hacer',
                            'en_proceso': 'En proceso',
                            'finalizada': 'Finalizada',
                            'pendiente': 'Pendiente'
                          };
                          return mapping[est] || est;
                        };
                        return (
                          <div key={mov.id} className="modal-editar-tarea__historial-item">
                            <div className="modal-editar-tarea__historial-indicador"></div>
                            <div className="modal-editar-tarea__historial-contenido">
                              <div className="modal-editar-tarea__historial-meta">
                                <span className="modal-editar-tarea__historial-usuario">
                                  {mov.usuario ? `${mov.usuario.nombre} ${mov.usuario.apellido}` : 'Usuario'}
                                </span>
                                <span className="modal-editar-tarea__historial-fecha">
                                  {formatearFechaHora(mov.fecha_movimiento)}
                                </span>
                              </div>
                              <p className="modal-editar-tarea__historial-texto">
                                Movió la tarea de <span className="modal-editar-tarea__historial-estado-badge">{mapEstado(mov.estado_anterior)}</span> a <span className={`modal-editar-tarea__historial-estado-badge modal-editar-tarea__historial-estado-badge--${mov.estado_nuevo}`}>{mapEstado(mov.estado_nuevo)}</span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sección Inferior: Notas y Equipos */}
            <div className="modal-editar-tarea__vista-contenido-inferior">
              
              {/* Nota de llamada (Descripción) */}
              <div className="modal-editar-tarea__vista-seccion">
                <span className="modal-editar-tarea__vista-label">Nota de Llamada / Detalle</span>
                <div className="modal-editar-tarea__vista-nota-caja">
                  {tarea.nota_llamada ? (
                    <p className="modal-editar-tarea__vista-nota-texto">{tarea.nota_llamada}</p>
                  ) : (
                    <p className="modal-editar-tarea__vista-nota-texto modal-editar-tarea__vista-nota-texto--vacio">
                      Sin descripción ni notas adicionales.
                    </p>
                  )}
                </div>
              </div>

              {/* Callout de Solución o Pendiente */}
              {tarea.solucion && (
                <div className="modal-editar-tarea__callout modal-editar-tarea__callout--success">
                  <div className="modal-editar-tarea__callout-titulo">
                    <CheckCircle2 size={16} />
                    <span>Solución Aportada</span>
                  </div>
                  <p className="modal-editar-tarea__callout-texto">{tarea.solucion}</p>
                </div>
              )}

              {tarea.pendiente_descripcion && tarea.estado === 'pendiente' && (
                <div className="modal-editar-tarea__callout modal-editar-tarea__callout--warning">
                  <div className="modal-editar-tarea__callout-titulo">
                    <AlertCircle size={16} />
                    <span>Motivo de Suspensión (Pendiente)</span>
                  </div>
                  <p className="modal-editar-tarea__callout-texto">{tarea.pendiente_descripcion}</p>
                </div>
              )}

              {/* Equipo Asignado */}
              <div className="modal-editar-tarea__vista-seccion" style={{ marginTop: '4px' }}>
                <span className="modal-editar-tarea__vista-label">Equipo Asignado</span>
                {tarea.asignados && tarea.asignados.length > 0 ? (
                  <div className="modal-editar-tarea__vista-asignados-grid">
                    {tarea.asignados.map((u) => {
                      const initials = `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase();
                      const avatarColor = obtenerColorAvatar(u.nombre + u.apellido);
                      return (
                        <div key={u.id} className="modal-editar-tarea__vista-usuario-card">
                          <div className="modal-editar-tarea__vista-avatar" style={{ backgroundColor: avatarColor }}>
                            {initials}
                          </div>
                          <div className="modal-editar-tarea__vista-usuario-info">
                            <span className="modal-editar-tarea__vista-usuario-nombre">{u.nombre} {u.apellido}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="modal-editar-tarea__vista-nota-texto modal-editar-tarea__vista-nota-texto--vacio" style={{ padding: '8px 0' }}>
                    Ningún usuario asignado a esta tarea actualmente.
                  </p>
                )}
              </div>



            </div>

            {/* Acciones del Modo Vista */}
            <div className="modal-editar-tarea__acciones-vista">
              <Boton type="button" variante="secundario" onClick={onCerrar}>Cerrar</Boton>
              {(usuarioLogueado?.permisos?.tablero_editar === true || usuarioLogueado?.rol === 'super_usuario') && (
                <Boton type="button" onClick={() => setModoEdicion(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Edit size={15} />
                  Editar Tarea
                </Boton>
              )}
            </div>
          </div>
        ) : (
          /* MODO EDICIÓN (Formulario) */
          <form onSubmit={manejarEnvio} className="modal-editar-tarea__formulario">
            
            <div className="modal-editar-tarea__dos-columnas modal-editar-tarea__dos-columnas--edicion">
              
              {/* Columna Izquierda - Campos de texto */}
              <div className="modal-editar-tarea__col-principal">
                <CampoTexto 
                  etiqueta="Título de la Tarea" 
                  value={titulo} 
                  onChange={(e) => setTitulo(e.target.value)} 
                  id="edit-titulo-tarea" 
                  required
                />
                
                <div className="modal-editar-tarea__nota-campo" style={{ marginTop: '8px' }}>
                  <label className="campo-texto__etiqueta" htmlFor="edit-nota-tarea">
                    Nota de llamada / Detalles adicionales (opcional)
                  </label>
                  <textarea
                    id="edit-nota-tarea"
                    className="modal-editar-tarea__textarea"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    rows={4}
                    placeholder="Detalles sobre el requerimiento..."
                  />
                </div>

                <div className="modal-editar-tarea__fila" style={{ marginTop: '8px' }}>
                  <Selector
                    etiqueta="Sector"
                    id="edit-sector-tarea"
                    value={sectorId}
                    onChange={(e) => setSectorId(e.target.value)}
                    opciones={[
                      { valor: '', etiqueta: 'Seleccionar sector' },
                      ...sectores.filter((s) => (s.activo && s.nombre.toLowerCase() !== 'todos los sectores') || s.id === tarea.sector_id).map((s) => ({ valor: s.id, etiqueta: s.nombre })),
                    ]}
                    required
                  />
                  <Selector
                    etiqueta="Sede"
                    id="edit-sede-tarea"
                    value={sedeId}
                    onChange={(e) => setSedeId(e.target.value)}
                    opciones={[
                      { valor: '', etiqueta: 'Seleccionar sede' },
                      ...sedes.filter((s) => s.activo || s.id === tarea.sede_id).map((s) => ({ valor: s.id, etiqueta: s.nombre })),
                    ]}
                    required
                  />
                </div>
              </div>

              {/* Columna Derecha - Controles adicionales y asignaciones */}
              <div className="modal-editar-tarea__col-lateral">
                <div className="modal-editar-tarea__fila">
                  <Selector
                    etiqueta="Criticidad"
                    id="edit-criticidad-tarea"
                    value={criticidad}
                    onChange={(e) => setCriticidad(e.target.value as any)}
                    opciones={[
                      { valor: 'baja', etiqueta: 'Baja' },
                      { valor: 'media', etiqueta: 'Media' },
                      { valor: 'alta', etiqueta: 'Alta' },
                    ]}
                    required
                  />
                  <CampoTexto
                    etiqueta="Contacto (opcional)"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    id="edit-contacto-tarea"
                    placeholder="Número o nombre"
                  />
                </div>

                {sectorId && (
                  <div className="modal-editar-tarea__nota-campo" style={{ gap: '6px', marginTop: '12px' }}>
                    <label className="campo-texto__etiqueta">Asignar Equipo (opcional)</label>
                    {usuariosAsignables.length === 0 ? (
                      <p className="modal-asignar__vacio">No hay usuarios disponibles en este sector.</p>
                    ) : (
                      <div className="modal-asignar__lista" style={{ maxHeight: '160px', overflowY: 'auto' }}>
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
              </div>

            </div>

            {error && <p className="modal-editar-tarea__error">{error}</p>}

            {/* Acciones del Modo Edición */}
            <div className="modal-editar-tarea__acciones">
              <Boton type="button" variante="secundario" onClick={cancelarEdicion}>
                Cancelar
              </Boton>
              <Boton type="submit" disabled={enviando}>
                {enviando ? 'Guardando...' : 'Guardar Cambios'}
              </Boton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
