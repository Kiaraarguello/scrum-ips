import { useState, useEffect } from 'react';
import { User, Mail, Lock, Edit2, Check, X, ShieldCheck, Layers, Trophy } from 'lucide-react';
import type { ResumenPropio, Sector, RankingEquipo } from '../../tipos';
import { obtenerResumenPropio, obtenerRankingEquipo } from '../../servicios/estadisticas';
import { actualizarPerfilPropio, actualizarSectoresPropio, type PayloadPerfilPropio } from '../../servicios/usuarios';
import { listarSectores } from '../../servicios/sectores';
import { useAuth } from '../../contextos/ContextoAuth';
import { formatearFecha } from '../../utilidades/formatoFecha';
import { ordenarPorNombre } from '../../utilidades/ordenAlfabetico';
import CampoTexto from '../../componentes/CampoTexto/CampoTexto';
import Boton from '../../componentes/Boton/Boton';
import './MiPanel.css';

export default function MiPanel() {
  const { usuario, actualizarUsuario } = useAuth();
  const [resumen, setResumen] = useState<ResumenPropio | null>(null);
  const [rankingEquipo, setRankingEquipo] = useState<RankingEquipo | null>(null);
  const [todosLosSectores, setTodosLosSectores] = useState<Sector[]>([]);

  // Perfil
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState('');
  const [exitoPerfil, setExitoPerfil] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', confirmar: '' });

  // Sectores
  const [editandoSectores, setEditandoSectores] = useState(false);
  const [guardandoSectores, setGuardandoSectores] = useState(false);
  const [sectoresSeleccionados, setSectoresSeleccionados] = useState<number[]>([]);
  const [verTodos, setVerTodos] = useState(false);
  const [exitoSectores, setExitoSectores] = useState(false);

  useEffect(() => {
    obtenerResumenPropio().then(setResumen);
    obtenerRankingEquipo().then(setRankingEquipo);
    listarSectores().then(lista => setTodosLosSectores(lista.filter(s => s.activo)));
  }, []);

  useEffect(() => {
    if (usuario) {
      setForm(f => ({ ...f, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email }));
      setSectoresSeleccionados((usuario.sectores ?? []).map(s => s.id));
      setVerTodos(!!usuario.ver_todos);
    }
  }, [usuario]);

  // ── Perfil ──
  function cancelarPerfil() {
    setEditandoPerfil(false);
    setErrorPerfil('');
    setForm(f => ({ ...f, password: '', confirmar: '' }));
  }

  async function guardarPerfil() {
    setErrorPerfil('');
    if (!form.nombre.trim() || !form.apellido.trim() || !form.email.trim()) {
      setErrorPerfil('Nombre, apellido y email son obligatorios.');
      return;
    }
    if (form.password && form.password !== form.confirmar) {
      setErrorPerfil('Las contraseñas no coinciden.');
      return;
    }
    if (form.password && form.password.length < 6) {
      setErrorPerfil('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setGuardandoPerfil(true);
    try {
      const payload: PayloadPerfilPropio = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
      };
      if (form.password) payload.password = form.password;
      const actualizado = await actualizarPerfilPropio(payload);
      actualizarUsuario(actualizado);
      setEditandoPerfil(false);
      setForm(f => ({ ...f, password: '', confirmar: '' }));
      setExitoPerfil(true);
      setTimeout(() => setExitoPerfil(false), 3000);
    } catch (e: any) {
      setErrorPerfil(e?.response?.data?.detail ?? 'Error al guardar los cambios.');
    } finally {
      setGuardandoPerfil(false);
    }
  }

  // ── Sectores ──
  function toggleSector(id: number) {
    setSectoresSeleccionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  function cancelarSectores() {
    setEditandoSectores(false);
    setSectoresSeleccionados((usuario?.sectores ?? []).map(s => s.id));
    setVerTodos(!!usuario?.ver_todos);
  }

  async function guardarSectores() {
    setGuardandoSectores(true);
    try {
      const actualizado = await actualizarSectoresPropio({ 
        sector_ids: sectoresSeleccionados, 
        ver_todos: verTodos 
      });
      actualizarUsuario(actualizado);
      setEditandoSectores(false);
      setExitoSectores(true);
      setTimeout(() => setExitoSectores(false), 3000);
    } catch {
      // silencioso — el backend valida
    } finally {
      setGuardandoSectores(false);
    }
  }

  const sectoresAsignados = ordenarPorNombre(usuario?.sectores ?? []);
  const maxPuntosRanking = Math.max(...(rankingEquipo?.ranking.map(r => r.puntos) ?? [1]), 1);

  return (
    <div className="mi-panel pagina pagina--centrada">

      {/* Encabezado */}
      <div className="mi-panel__encabezado">
        <div>
          <h1 className="mi-panel__saludo">Hola, {usuario?.nombre}</h1>
          <p className="mi-panel__bienvenida">Bienvenido a tu panel personal</p>
        </div>
        {usuario?.ver_todos ? (
          <span className="mi-panel__sector-activo">Todos los sectores</span>
        ) : usuario?.sector && (
          <span className="mi-panel__sector-activo">{usuario.sector.nombre}</span>
        )}
      </div>

      {/* Cifras */}
      {resumen && (
        <div className="mi-panel__cifras">
          <div className="mi-panel__cifra">
            <span className="mi-panel__numero">{resumen.en_proceso}</span>
            <span className="mi-panel__etiqueta">En proceso</span>
          </div>
          <div className="mi-panel__cifra">
            <span className="mi-panel__numero">{resumen.finalizadas_7_dias}</span>
            <span className="mi-panel__etiqueta">Finalizadas (7 días)</span>
          </div>
          <div className="mi-panel__cifra">
            <span className="mi-panel__numero">{resumen.finalizadas_total}</span>
            <span className="mi-panel__etiqueta">Total finalizadas</span>
          </div>
        </div>
      )}

      <div className="mi-panel__contenido">

        {/* ── Datos personales ── */}
        <section className="mi-panel__seccion">
          <div className="mi-panel__seccion-cabecera">
            <div className="mi-panel__seccion-titulo-grupo">
              <div className="mi-panel__avatar"><User size={20} /></div>
              <h2 className="mi-panel__seccion-titulo">Datos personales</h2>
            </div>
            {!editandoPerfil && (
              <button className="mi-panel__btn-editar" onClick={() => setEditandoPerfil(true)}>
                <Edit2 size={14} /> Editar
              </button>
            )}
          </div>

          {!editandoPerfil ? (
            <div className="mi-panel__datos">
              <div className="mi-panel__dato">
                <span className="mi-panel__dato-label"><User size={13} /> Nombre</span>
                <span className="mi-panel__dato-valor">{usuario?.nombre} {usuario?.apellido}</span>
              </div>
              <div className="mi-panel__dato">
                <span className="mi-panel__dato-label"><Mail size={13} /> Email</span>
                <span className="mi-panel__dato-valor">{usuario?.email}</span>
              </div>
              <div className="mi-panel__dato">
                <span className="mi-panel__dato-label"><ShieldCheck size={13} /> Rol</span>
                <span className={`mi-panel__rol mi-panel__rol--${usuario?.rol}`}>
                  {usuario?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              <div className="mi-panel__dato">
                <span className="mi-panel__dato-label"><Lock size={13} /> Contraseña</span>
                <span className="mi-panel__dato-valor mi-panel__password-mask">••••••••</span>
              </div>
              {exitoPerfil && (
                <div className="mi-panel__exito"><Check size={14} /> Datos actualizados</div>
              )}
            </div>
          ) : (
            <div className="mi-panel__form">
              <div className="mi-panel__form-fila">
                <CampoTexto etiqueta="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre" />
                <CampoTexto etiqueta="Apellido" value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} placeholder="Tu apellido" />
              </div>
              <CampoTexto etiqueta="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@ejemplo.com" />
              <div className="mi-panel__separador"><span>Cambiar contraseña (opcional)</span></div>
              <div className="mi-panel__form-fila">
                <CampoTexto etiqueta="Nueva contraseña" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
                <CampoTexto etiqueta="Confirmar contraseña" type="password" value={form.confirmar} onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))} placeholder="Repetir contraseña" />
              </div>
              {errorPerfil && <p className="mi-panel__error">{errorPerfil}</p>}
              <div className="mi-panel__form-acciones">
                <Boton variante="fantasma" onClick={cancelarPerfil} disabled={guardandoPerfil}><X size={15} /> Cancelar</Boton>
                <Boton variante="primario" onClick={guardarPerfil} disabled={guardandoPerfil}>
                  {guardandoPerfil ? 'Guardando...' : <><Check size={15} /> Guardar</>}
                </Boton>
              </div>
            </div>
          )}
        </section>

        {/* ── Sectores asignados ── */}
        <section className="mi-panel__seccion">
          <div className="mi-panel__seccion-cabecera">
            <div className="mi-panel__seccion-titulo-grupo">
              <div className="mi-panel__avatar"><Layers size={20} /></div>
              <h2 className="mi-panel__seccion-titulo">Sectores asignados</h2>
            </div>
            {!editandoSectores && (
              <button className="mi-panel__btn-editar" onClick={() => setEditandoSectores(true)}>
                <Edit2 size={14} /> Editar
              </button>
            )}
          </div>

          {!editandoSectores ? (
            <div className="mi-panel__sectores-vista">
              {sectoresAsignados.length === 0 && !usuario?.ver_todos ? (
                <p className="mi-panel__sin-sectores">No tenés sectores asignados.</p>
              ) : (
                <div className="mi-panel__sectores-chips">
                  {usuario?.ver_todos && (
                    <span className="mi-panel__sector-chip mi-panel__sector-chip--activo">
                      Todos los sectores
                    </span>
                  )}
                  {sectoresAsignados.map(s => (
                    <span
                      key={s.id}
                      className={`mi-panel__sector-chip ${s.id === usuario?.sector_id && !usuario.ver_todos ? 'mi-panel__sector-chip--activo' : ''}`}
                    >
                      {s.nombre}
                      {s.id === usuario?.sector_id && !usuario.ver_todos && <span className="mi-panel__sector-chip-badge">activo</span>}
                    </span>
                  ))}
                </div>
              )}
              {exitoSectores && (
                <div className="mi-panel__exito"><Check size={14} /> Sectores actualizados</div>
              )}
            </div>
          ) : (
            <div className="mi-panel__sectores-form">
              <p className="mi-panel__sectores-ayuda">Seleccioná los sectores en los que trabajás.</p>
              <div className="mi-panel__sectores-opciones">
                {/* Opción virtual: Todos los sectores */}
                <label className={`mi-panel__sector-opcion ${verTodos ? 'mi-panel__sector-opcion--marcado' : ''}`}>
                  <input
                    type="checkbox"
                    checked={verTodos}
                    onChange={() => setVerTodos(!verTodos)}
                    className="mi-panel__sector-checkbox"
                  />
                  <span className="mi-panel__sector-nombre">Todos los sectores</span>
                  <span className="mi-panel__sector-desc">Ver tareas de todas las áreas</span>
                </label>

                {todosLosSectores.map(s => (
                  <label key={s.id} className={`mi-panel__sector-opcion ${sectoresSeleccionados.includes(s.id) ? 'mi-panel__sector-opcion--marcado' : ''}`}>
                    <input
                      type="checkbox"
                      checked={sectoresSeleccionados.includes(s.id)}
                      onChange={() => toggleSector(s.id)}
                      className="mi-panel__sector-checkbox"
                    />
                    <span className="mi-panel__sector-nombre">{s.nombre}</span>
                    {s.descripcion && <span className="mi-panel__sector-desc">{s.descripcion}</span>}
                  </label>
                ))}
              </div>
              <div className="mi-panel__form-acciones">
                <Boton variante="fantasma" onClick={cancelarSectores} disabled={guardandoSectores}><X size={15} /> Cancelar</Boton>
                <Boton variante="primario" onClick={guardarSectores} disabled={guardandoSectores}>
                  {guardandoSectores ? 'Guardando...' : <><Check size={15} /> Guardar</>}
                </Boton>
              </div>
            </div>
          )}
        </section>

        {/* ── Ranking de puntuación ── */}
        {rankingEquipo && (
          <section className="mi-panel__seccion">
            <div className="mi-panel__seccion-cabecera">
              <div className="mi-panel__seccion-titulo-grupo">
                <div className="mi-panel__avatar"><Trophy size={20} /></div>
                <div>
                  <h2 className="mi-panel__seccion-titulo">Ranking de puntuación</h2>
                  <p className="mi-panel__ranking-ayuda">Alta = 3 pts · Media = 2 pts · Baja = 1 pt</p>
                </div>
              </div>
            </div>

            <div className="mi-panel__ranking-resumen">
              <div className="mi-panel__ranking-mi-dato">
                <span className="mi-panel__ranking-mi-numero">{rankingEquipo.mis_puntos}</span>
                <span className="mi-panel__ranking-mi-etiqueta">Tus puntos</span>
              </div>
              <div className="mi-panel__ranking-mi-dato">
                <span className="mi-panel__ranking-mi-numero">
                  {rankingEquipo.mi_posicion ?? '—'}
                </span>
                <span className="mi-panel__ranking-mi-etiqueta">Tu posición</span>
              </div>
              <div className="mi-panel__ranking-mi-dato">
                <span className="mi-panel__ranking-mi-numero">{rankingEquipo.mis_tareas_finalizadas}</span>
                <span className="mi-panel__ranking-mi-etiqueta">Finalizadas</span>
              </div>
            </div>

            {rankingEquipo.ranking.length === 0 ? (
              <p className="mi-panel__ranking-vacio">Todavía no hay tareas finalizadas en el equipo.</p>
            ) : (
              <ol className="mi-panel__ranking-lista">
                {rankingEquipo.ranking.map((item, index) => {
                  const posicion = index + 1;
                  const esYo = item.usuario_id === usuario?.id;
                  return (
                    <li
                      key={item.usuario_id}
                      className={`mi-panel__ranking-item ${esYo ? 'mi-panel__ranking-item--yo' : ''}`}
                    >
                      <span className="mi-panel__ranking-pos">{posicion}</span>
                      <div className="mi-panel__ranking-info">
                        <span className="mi-panel__ranking-nombre">
                          {item.nombre} {item.apellido}
                          {esYo && <span className="mi-panel__ranking-yo-badge">Tú</span>}
                        </span>
                        <span className="mi-panel__ranking-detalle">
                          {item.tareas_finalizadas} tareas finalizadas
                        </span>
                        <div className="mi-panel__ranking-barra-fondo">
                          <div
                            className="mi-panel__ranking-barra-relleno"
                            style={{ width: `${Math.round((item.puntos / maxPuntosRanking) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="mi-panel__ranking-puntos">{item.puntos} pts</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        )}

        {/* ── Últimas tareas ── */}
        {resumen && resumen.ultimas_finalizadas.length > 0 && (
          <section className="mi-panel__seccion">
            <div className="mi-panel__seccion-cabecera">
              <div className="mi-panel__seccion-titulo-grupo">
                <h2 className="mi-panel__seccion-titulo">Últimas tareas finalizadas</h2>
              </div>
            </div>
            <ul className="mi-panel__lista">
              {resumen.ultimas_finalizadas.map((t) => (
                <li key={t.id} className="mi-panel__item">
                  <span className="mi-panel__item-titulo">{t.titulo}</span>
                  <span className="mi-panel__item-fecha">{formatearFecha(t.fecha)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}
