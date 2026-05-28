import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import type { Usuario, Sector } from '../../tipos';
import { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../../servicios/usuarios';
import { listarSectores } from '../../servicios/sectores';
import Boton from '../../componentes/Boton/Boton';
import CampoTexto from '../../componentes/CampoTexto/CampoTexto';
import Selector from '../../componentes/Selector/Selector';
import { useAuth } from '../../contextos/ContextoAuth';
import './GestionUsuarios.css';

interface FormUsuario {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmar: string;
  rol: string;
  sector_ids: number[];
}

const FORM_VACIO: FormUsuario = { nombre: '', apellido: '', email: '', password: '', confirmar: '', rol: 'usuario', sector_ids: [] };

export default function GestionUsuarios() {
  const { usuario: usuarioActual } = useAuth();
  const esAdminNormal = usuarioActual?.rol === 'admin';
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormUsuario>(FORM_VACIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  useEffect(() => {
    listarUsuarios().then(setUsuarios);
    listarSectores().then(lista => setSectores(lista.filter(s => s.activo)));
  }, []);

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_VACIO);
    setMostrarForm(true);
  }

  function abrirEditar(u: Usuario) {
    setEditando(u.id);
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      password: '',
      confirmar: '',
      rol: u.rol,
      sector_ids: (u.sectores ?? []).map(s => s.id),
    });
    setMostrarForm(true);
  }

  function toggleSector(id: number) {
    setForm(prev => ({
      ...prev,
      sector_ids: prev.sector_ids.includes(id)
        ? prev.sector_ids.filter(s => s !== id)
        : [...prev.sector_ids, id],
    }));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setErrorForm('');
    if (form.password && form.password !== form.confirmar) {
      setErrorForm('Las contraseñas no coinciden.');
      return;
    }
    const payload = { nombre: form.nombre, apellido: form.apellido, email: form.email, rol: form.rol as 'admin' | 'usuario', sector_ids: form.sector_ids };
    if (editando) {
      const p: any = { ...payload };
      if (form.password) p.password = form.password;
      const actualizado = await actualizarUsuario(editando, p);
      setUsuarios(prev => prev.map(u => u.id === editando ? actualizado : u));
    } else {
      const nuevo = await crearUsuario({ ...payload, password: form.password });
      setUsuarios(prev => [...prev, nuevo]);
    }
    setMostrarForm(false);
  }

  async function borrar(id: number) {
    await eliminarUsuario(id);
    setUsuarios(prev => prev.filter(u => u.id !== id));
  }

  return (
    <div className="gestion-usuarios pagina pagina--centrada">
      <Link to="/admin" className="btn-volver">
        <ArrowLeft size={18} />
        Volver al Panel Admin
      </Link>
      <div className="gestion-usuarios__cabecera">
        <h1 className="gestion-usuarios__titulo">Usuarios</h1>
        <Boton onClick={abrirCrear}><UserPlus size={16} /> Nuevo usuario</Boton>
      </div>

      {mostrarForm && (
        <div className="modal-formulario__fondo" onClick={() => setMostrarForm(false)}>
          <form onSubmit={guardar} className="modal-formulario__caja modal-formulario__caja--ancho" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-formulario__titulo">
              {editando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <div className="modal-formulario__campos">
              <div className="gestion-usuarios__fila">
                <CampoTexto etiqueta="Nombre" id="nombre" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} required />
                <CampoTexto etiqueta="Apellido" id="apellido" value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} required />
              </div>
              <CampoTexto etiqueta="Email" id="email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              <div className="gestion-usuarios__separador">
                <span>{editando !== null ? 'Cambiar contraseña (opcional)' : 'Contraseña'}</span>
              </div>
              <div className="gestion-usuarios__fila">
                <CampoTexto
                  etiqueta={editando !== null ? 'Nueva contraseña' : 'Contraseña'}
                  id="pwd"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder={editando !== null ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                  required={editando === null}
                />
                <CampoTexto
                  etiqueta="Confirmar contraseña"
                  id="confirmar"
                  type="password"
                  value={form.confirmar}
                  onChange={e => setForm(p => ({ ...p, confirmar: e.target.value }))}
                  placeholder="Repetir contraseña"
                  required={editando === null}
                />
              </div>
              {!esAdminNormal && (
                <Selector
                  etiqueta="Rol"
                  id="rol"
                  value={form.rol}
                  onChange={e => setForm(p => ({ ...p, rol: e.target.value, sector_ids: e.target.value === 'admin' ? [] : p.sector_ids }))}
                  opciones={[{ valor: 'usuario', etiqueta: 'Usuario' }, { valor: 'admin', etiqueta: 'Admin' }]}
                />
              )}

              {form.rol === 'usuario' && <div className="gestion-usuarios__sectores-campo">
                <span className="gestion-usuarios__sectores-etiqueta">Sectores asignados</span>
                <div className="gestion-usuarios__sectores-opciones">
                  {sectores.map(s => (
                    <label
                      key={s.id}
                      className={`gestion-usuarios__sector-opcion ${form.sector_ids.includes(s.id) ? 'gestion-usuarios__sector-opcion--marcado' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={form.sector_ids.includes(s.id)}
                        onChange={() => toggleSector(s.id)}
                        className="gestion-usuarios__sector-checkbox"
                      />
                      {s.nombre}
                    </label>
                  ))}
                </div>
              </div>}
            </div>

            {errorForm && <p className="gestion-usuarios__error">{errorForm}</p>}
            <div className="gestion-usuarios__acciones">
              <Boton type="button" variante="secundario" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
              <Boton type="submit">{editando ? 'Guardar cambios' : 'Crear usuario'}</Boton>
            </div>
          </form>
        </div>
      )}

      <div className="gestion-usuarios__lista">
        {usuarios.map((u) => (
          <div key={u.id} className="gestion-usuarios__item">
            <div className="gestion-usuarios__info">
              <div className="gestion-usuarios__nombre-fila">
                <span className="gestion-usuarios__nombre">{u.nombre} {u.apellido}</span>
                {!esAdminNormal && <span className={`gestion-usuarios__rol gestion-usuarios__rol--${u.rol}`}>{u.rol}</span>}
                <span className={`gestion-usuarios__estado ${u.activo ? 'gestion-usuarios__estado--activo' : 'gestion-usuarios__estado--inactivo'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
              <p className="gestion-usuarios__detalle">
                <strong>Email:</strong> {u.email}
              </p>
              <div className="gestion-usuarios__sectores-seccion">
                <span className="gestion-usuarios__sectores-label">Sectores:</span>
                <div className="gestion-usuarios__sectores-lista">
                  {(u.sectores ?? []).length === 0
                    ? <span className="gestion-usuarios__sin-sector">—</span>
                    : (u.sectores ?? []).map(s => (
                        <span key={s.id} className={`gestion-usuarios__sector-tag ${s.id === u.sector_id ? 'gestion-usuarios__sector-tag--activo' : ''}`}>{s.nombre}</span>
                      ))
                  }
                </div>
              </div>
            </div>
            <div className="gestion-usuarios__acciones-item">
              <Boton variante="fantasma" onClick={() => abrirEditar(u)}><Pencil size={18} /></Boton>
              <Boton variante="peligro" onClick={() => borrar(u.id)}><Trash2 size={18} /></Boton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
