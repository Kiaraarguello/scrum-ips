import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Trash2, Calendar, Users, Shield, User as UserIcon, Check } from 'lucide-react';
import { useAuth } from '../../contextos/ContextoAuth';
import { listarProyectos, crearProyecto, eliminarProyecto, type Proyecto } from '../../servicios/proyectos';
import { listarUsuarios } from '../../servicios/usuarios';
import { type Usuario } from '../../tipos';
import Boton from '../../componentes/Boton/Boton';
import CampoTexto from '../../componentes/CampoTexto/CampoTexto';
import './GestionBacklog.css';

export default function GestionBacklog() {
  const { usuario: usuarioAutenticado } = useAuth();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      const [dataProyectos, dataUsuarios] = await Promise.all([
        listarProyectos(),
        listarUsuarios()
      ]);
      let proyectosFiltrados = dataProyectos;
      if (usuarioAutenticado && usuarioAutenticado.rol !== 'admin') {
        proyectosFiltrados = dataProyectos.filter(p => 
          p.usuarios?.some(u => u.id === usuarioAutenticado.id)
        );
      }
      setProyectos(proyectosFiltrados);
      setUsuarios(dataUsuarios.filter(u => u.activo));
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  async function manejarCrear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    try {
      await crearProyecto({ 
        nombre: nombre.trim(), 
        descripcion: descripcion.trim(),
        usuarios_ids: usuariosSeleccionados
      });
      setNombre('');
      setDescripcion('');
      setUsuariosSeleccionados([]);
      setMostrarModal(false);
      cargar();
    } catch (err) {
      console.error(err);
    }
  }

  async function manejarEliminar(id: number) {
    if (!confirm('¿Estás seguro de eliminar este proyecto y todas sus tareas?')) return;
    try {
      await eliminarProyecto(id);
      cargar();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="gestion-backlog pagina">
      <div className="gestion-backlog__cabecera">
        <div>
          <h1 className="gestion-backlog__titulo">Backlog de Proyectos</h1>
          <p className="gestion-backlog__subtitulo">
            {usuarioAutenticado?.rol === 'admin' 
              ? 'Gestiona y visualiza los tableros de cada proyecto independiente.'
              : 'Visualiza los proyectos en los que participas.'}
          </p>
        </div>
        {usuarioAutenticado?.rol === 'admin' && (
          <Boton onClick={() => setMostrarModal(true)}>
            <Plus size={18} />
            Nuevo Proyecto
          </Boton>
        )}
      </div>

      {cargando ? (
        <div className="gestion-backlog__cargando">Cargando proyectos...</div>
      ) : (
        <div className="gestion-backlog__grilla">
          {proyectos.map((p) => (
            <div key={p.id} className="gestion-backlog__tarjeta">
              <div className="gestion-backlog__tarjeta-info">
                <div className="gestion-backlog__tarjeta-icono">
                  <FolderKanban size={24} />
                </div>
                <div>
                  <h3 className="gestion-backlog__tarjeta-nombre">{p.nombre}</h3>
                  <p className="gestion-backlog__tarjeta-desc">{p.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
              
              <div className="gestion-backlog__tarjeta-meta">
                <Calendar size={14} />
                <span>Creado el {new Date(p.fecha_creacion).toLocaleDateString()}</span>
              </div>

              <div className="gestion-backlog__tarjeta-acciones">
                <Link to={`/admin/backlog/${p.id}`} className="gestion-backlog__enlace">
                  Ver Tablero
                </Link>
                {usuarioAutenticado?.rol === 'admin' && (
                  <button 
                    className="gestion-backlog__btn-eliminar" 
                    onClick={() => manejarEliminar(p.id)}
                    title="Eliminar proyecto"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {proyectos.length === 0 && (
            <div className="gestion-backlog__vacio">
              No hay proyectos creados aún.
            </div>
          )}
        </div>
      )}

      {mostrarModal && (
        <div className="gestion-backlog__modal-fondo" onClick={() => setMostrarModal(false)}>
          <div className="gestion-backlog__modal-caja" onClick={(e) => e.stopPropagation()}>
            <h2 className="gestion-backlog__modal-titulo">Crear Nuevo Proyecto</h2>
            <form onSubmit={manejarCrear} className="gestion-backlog__formulario">
              <CampoTexto 
                etiqueta="Nombre del Proyecto" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Ej: Migración de Servidores"
              />
              <div className="campo-texto">
                <label className="campo-texto__etiqueta">Descripción (opcional)</label>
                <textarea 
                  className="gestion-backlog__textarea"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Breve descripción del objetivo..."
                  rows={3}
                />
              </div>

              <div className="gestion-backlog__seleccion-usuarios">
                <label className="campo-texto__etiqueta">Participantes del Proyecto</label>
                
                <div className="gestion-backlog__grupos-usuarios">
                  <div className="gestion-backlog__grupo-usuarios">
                    <div className="gestion-backlog__grupo-titulo">
                      <Shield size={14} />
                      <span>Administradores</span>
                    </div>
                    <div className="gestion-backlog__lista-usuarios">
                      {usuarios.filter(u => u.rol === 'admin').map(u => (
                        <div 
                          key={u.id} 
                          className={`gestion-backlog__usuario-item ${usuariosSeleccionados.includes(u.id) ? 'seleccionado' : ''}`}
                          onClick={() => {
                            setUsuariosSeleccionados(prev => 
                              prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                            );
                          }}
                        >
                          <div className="gestion-backlog__usuario-avatar">
                            {u.nombre[0]}{u.apellido[0]}
                          </div>
                          <span className="gestion-backlog__usuario-nombre">{u.nombre} {u.apellido}</span>
                          {usuariosSeleccionados.includes(u.id) && <Check size={14} className="gestion-backlog__check" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="gestion-backlog__grupo-usuarios">
                    <div className="gestion-backlog__grupo-titulo">
                      <UserIcon size={14} />
                      <span>Usuarios</span>
                    </div>
                    <div className="gestion-backlog__lista-usuarios">
                      {usuarios.filter(u => u.rol === 'usuario').map(u => (
                        <div 
                          key={u.id} 
                          className={`gestion-backlog__usuario-item ${usuariosSeleccionados.includes(u.id) ? 'seleccionado' : ''}`}
                          onClick={() => {
                            setUsuariosSeleccionados(prev => 
                              prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                            );
                          }}
                        >
                          <div className="gestion-backlog__usuario-avatar">
                            {u.nombre[0]}{u.apellido[0]}
                          </div>
                          <span className="gestion-backlog__usuario-nombre">{u.nombre} {u.apellido}</span>
                          {usuariosSeleccionados.includes(u.id) && <Check size={14} className="gestion-backlog__check" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="gestion-backlog__modal-acciones">
                <Boton type="button" variante="secundario" onClick={() => {
                  setMostrarModal(false);
                  setUsuariosSeleccionados([]);
                }}>
                  Cancelar
                </Boton>
                <Boton type="submit" disabled={!nombre.trim()}>
                  Crear Proyecto
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
