import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, ShieldAlert, User, Check, Eye, HelpCircle } from 'lucide-react';
import { impersonarRol } from '../../servicios/autenticacion';
import Boton from '../../componentes/Boton/Boton';
import './AdministradorPermisos.css';

interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface ModuloPermisos {
  titulo: string;
  permisos: Permiso[];
}

type Rol = 'super_admin' | 'admin' | 'usuario';

export default function AdministradorPermisos() {
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol>('admin');
  const [cargandoIncognito, setCargandoIncognito] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Perfiles de permisos mockeados interactivos para cada rol que el Super Usuario (super_usuario) puede administrar
  const [permisosPorRol, setPermisosPorRol] = useState<Record<Rol, ModuloPermisos[]>>({
    super_admin: [
      {
        titulo: 'Módulo: Tablero de Tareas',
        permisos: [
          { id: 'tablero_ver', nombre: 'Ver tablero completo', descripcion: 'Acceso de lectura a todas las columnas del tablero.', activo: true },
          { id: 'tablero_crear', nombre: 'Crear nuevas tareas', descripcion: 'Habilidad de registrar solicitudes y tickets de soporte.', activo: true },
          { id: 'tablero_mover', nombre: 'Mover y cambiar estados', descripcion: 'Iniciar, pausar o cancelar tareas en curso.', activo: true },
          { id: 'tablero_finalizar', nombre: 'Finalizar tareas', descripcion: 'Cerrar tareas ingresando diagnóstico y solución técnica.', activo: true },
        ],
      },
      {
        titulo: 'Módulo: Administración General',
        permisos: [
          { id: 'admin_panel', nombre: 'Acceso a Panel Admin', descripcion: 'Habilita el ingreso a las secciones administrativas de la app.', activo: true },
          { id: 'admin_usuarios', nombre: 'Administrar Usuarios', descripcion: 'Crear, editar o dar de baja cuentas y roles del personal.', activo: true },
          { id: 'admin_sectores_sedes', nombre: 'Administrar Sectores y Sedes', descripcion: 'Configurar sedes físicas y áreas departamentales.', activo: true },
        ],
      },
      {
        titulo: 'Módulo: Auditoría y Control',
        permisos: [
          { id: 'auditoria_logs', nombre: 'Logs de Auditoría', descripcion: 'Visualizar bitácora detallada de inicios de sesión y movimientos.', activo: false },
          { id: 'auditoria_stats', nombre: 'KPIs y Estadísticas', descripcion: 'Ver tableros de rendimiento y rankings de productividad.', activo: true },
        ],
      },
    ],
    admin: [
      {
        titulo: 'Módulo: Tablero de Tareas',
        permisos: [
          { id: 'tablero_ver', nombre: 'Ver tablero completo', descripcion: 'Acceso de lectura a todas las columnas del tablero.', activo: true },
          { id: 'tablero_crear', nombre: 'Crear nuevas tareas', descripcion: 'Habilidad de registrar solicitudes y tickets de soporte.', activo: true },
          { id: 'tablero_mover', nombre: 'Mover y cambiar estados', descripcion: 'Iniciar, pausar o cancelar tareas en curso.', activo: true },
          { id: 'tablero_finalizar', nombre: 'Finalizar tareas', descripcion: 'Cerrar tareas ingresando diagnóstico y solución técnica.', activo: true },
        ],
      },
      {
        titulo: 'Módulo: Administración General',
        permisos: [
          { id: 'admin_panel', nombre: 'Acceso a Panel Admin', descripcion: 'Habilita el ingreso a las secciones administrativas de la app.', activo: true },
          { id: 'admin_usuarios', nombre: 'Administrar Usuarios', descripcion: 'Crear, editar o dar de baja cuentas y roles del personal.', activo: false },
          { id: 'admin_sectores_sedes', nombre: 'Administrar Sectores y Sedes', descripcion: 'Configurar sedes físicas y áreas departamentales.', activo: true },
        ],
      },
      {
        titulo: 'Módulo: Auditoría y Control',
        permisos: [
          { id: 'auditoria_logs', nombre: 'Logs de Auditoría', descripcion: 'Visualizar bitácora detallada de inicios de sesión y movimientos.', activo: false },
          { id: 'auditoria_stats', nombre: 'KPIs y Estadísticas', descripcion: 'Ver tableros de rendimiento y rankings de productividad.', activo: true },
        ],
      },
    ],
    usuario: [
      {
        titulo: 'Módulo: Tablero de Tareas',
        permisos: [
          { id: 'tablero_ver', nombre: 'Ver tablero de mi sector', descripcion: 'Acceso de lectura limitado a tareas de su sector asignado.', activo: true },
          { id: 'tablero_crear', nombre: 'Crear nuevas tareas', descripcion: 'Habilidad de registrar solicitudes y tickets de soporte.', activo: true },
          { id: 'tablero_mover', nombre: 'Mover mis tareas', descripcion: 'Iniciar o pausar únicamente tareas que le fueron asignadas.', activo: true },
          { id: 'tablero_finalizar', nombre: 'Finalizar mis tareas', descripcion: 'Cerrar tareas ingresando diagnóstico y solución técnica.', activo: true },
        ],
      },
      {
        titulo: 'Módulo: Administración General',
        permisos: [
          { id: 'admin_panel', nombre: 'Acceso a Panel Admin', descripcion: 'Habilita el ingreso a las secciones administrativas de la app.', activo: false },
          { id: 'admin_usuarios', nombre: 'Administrar Usuarios', descripcion: 'Crear, editar o dar de baja cuentas y roles del personal.', activo: false },
          { id: 'admin_sectores_sedes', nombre: 'Administrar Sectores y Sedes', descripcion: 'Configurar sedes físicas y áreas departamentales.', activo: false },
        ],
      },
      {
        titulo: 'Módulo: Auditoría y Control',
        permisos: [
          { id: 'auditoria_logs', nombre: 'Logs de Auditoría', descripcion: 'Visualizar bitácora detallada de inicios de sesión y movimientos.', activo: false },
          { id: 'auditoria_stats', nombre: 'KPIs y Estadísticas', descripcion: 'Ver tableros de rendimiento y rankings de productividad.', activo: false },
        ],
      },
    ],
  });

  // Manejar el cambio en los checkboxes de permisos interactivos
  function togglePermiso(moduloIndex: number, permisoIndex: number) {
    setPermisosPorRol(prev => {
      const perfilModificado = [...prev[rolSeleccionado]];
      const moduloModificado = { ...perfilModificado[moduloIndex] };
      const permisosModificados = [...moduloModificado.permisos];
      
      permisosModificados[permisoIndex] = {
        ...permisosModificados[permisoIndex],
        activo: !permisosModificados[permisoIndex].activo
      };
      
      moduloModificado.permisos = permisosModificados;
      perfilModificado[moduloIndex] = moduloModificado;

      return {
        ...prev,
        [rolSeleccionado]: perfilModificado
      };
    });
  }

  // Activar modo incógnito llamando al backend
  async function activarModoIncognito() {
    setCargandoIncognito(true);
    try {
      const res = await impersonarRol(rolSeleccionado);
      
      // Respaldar token real y almacenar el incógnito
      const tokenReal = localStorage.getItem('token') || '';
      localStorage.setItem('token_real', tokenReal);
      localStorage.setItem('token', res.token);

      // Redirigir al tablero con un reinicio limpio
      window.location.href = '/tablero';
    } catch (err) {
      console.error(err);
      alert('Error al iniciar el modo incógnito de visualización.');
      setCargandoIncognito(false);
    }
  }

  function guardarCambiosSimulados() {
    setGuardadoExitoso(true);
    setTimeout(() => {
      setGuardadoExitoso(false);
    }, 3000);
  }

  return (
    <div className="permisos-admin pagina pagina--centrada animate-fade-in">
      <Link to="/admin/usuarios" className="btn-volver">
        <ArrowLeft size={18} />
        Volver a Usuarios
      </Link>

      <div className="permisos-admin__cabecera">
        <h1 className="permisos-admin__titulo">Administrador de Permisos</h1>
        <p className="permisos-admin__subtitulo">
          Como Super Usuario, tenes acceso total garantizado al sistema. Utiliza este panel para administrar de forma modular los accesos de los otros roles e ingresar en Modo Incógnito para experimentar lo que ven.
        </p>
      </div>

      {/* Grid de los 3 Roles a Administrar (Cajitas) */}
      <div className="permisos-admin__roles-grid">
        {/* Tarjeta Super Admin */}
        <div 
          className={`permisos-admin__rol-card permisos-admin__rol-card--super ${rolSeleccionado === 'super_admin' ? 'permisos-admin__rol-card--activo' : ''}`}
          onClick={() => setRolSeleccionado('super_admin')}
        >
          <div className="permisos-admin__rol-icon-wrapper">
            <ShieldAlert size={28} className="permisos-admin__rol-icon" />
          </div>
          <h3 className="permisos-admin__rol-nombre">Super Admin</h3>
          <span className="permisos-admin__rol-badge">Gestión Alta</span>
          <p className="permisos-admin__rol-desc">
            Segundo nivel de control. Acceso a estadísticas globales, visualización de KPIs de usuarios, gestión completa de sedes y sectores corporativos.
          </p>
        </div>

        {/* Tarjeta Administrador */}
        <div 
          className={`permisos-admin__rol-card permisos-admin__rol-card--admin ${rolSeleccionado === 'admin' ? 'permisos-admin__rol-card--activo' : ''}`}
          onClick={() => setRolSeleccionado('admin')}
        >
          <div className="permisos-admin__rol-icon-wrapper">
            <Shield size={28} className="permisos-admin__rol-icon" />
          </div>
          <h3 className="permisos-admin__rol-nombre">Administrador</h3>
          <span className="permisos-admin__rol-badge">Gestión Media</span>
          <p className="permisos-admin__rol-desc">
            Coordinación operativa. Gestión del backlog de proyectos, asignación de tareas técnicas, sedes, y visualización de alertas internas.
          </p>
        </div>

        {/* Tarjeta Usuario */}
        <div 
          className={`permisos-admin__rol-card permisos-admin__rol-card--usuario ${rolSeleccionado === 'usuario' ? 'permisos-admin__rol-card--activo' : ''}`}
          onClick={() => setRolSeleccionado('usuario')}
        >
          <div className="permisos-admin__rol-icon-wrapper">
            <User size={28} className="permisos-admin__rol-icon" />
          </div>
          <h3 className="permisos-admin__rol-nombre">Usuario Estándar</h3>
          <span className="permisos-admin__rol-badge">Operativo</span>
          <p className="permisos-admin__rol-desc">
            Acceso técnico básico. Visualización y ejecución del tablero de su sector de trabajo asignado, registro de diagnósticos y cierres.
          </p>
        </div>
      </div>

      {/* Editor de Permisos del Rol Seleccionado */}
      <div className="permisos-admin__editor-caja modern-card">
        <div className="permisos-admin__editor-cabecera">
          <div>
            <h2 className="permisos-admin__editor-titulo">
              Configurando Accesos: <span className="permisos-admin__rol-destacado">{rolSeleccionado === 'super_admin' ? 'Super Admin' : rolSeleccionado === 'admin' ? 'Administrador' : 'Usuario'}</span>
            </h2>
            <p className="permisos-admin__editor-subtitulo">
              Los cambios guardados definirán lo que los usuarios con este rol pueden visualizar y realizar en el sistema.
            </p>
          </div>

          <div className="permisos-admin__editor-acciones-top">
            <button 
              className="btn-visualizar-incognito"
              onClick={activarModoIncognito}
              disabled={cargandoIncognito}
            >
              <Eye size={16} />
              {cargandoIncognito ? 'Entrando...' : 'Visualizar Rol (Modo Incógnito)'}
            </button>
          </div>
        </div>

        <div className="permisos-admin__modulos-lista">
          {permisosPorRol[rolSeleccionado].map((modulo, mIdx) => (
            <div key={modulo.titulo} className="permisos-admin__modulo-item">
              <h4 className="permisos-admin__modulo-titulo">{modulo.titulo}</h4>
              <div className="permisos-admin__permisos-lista">
                {modulo.permisos.map((permiso, pIdx) => (
                  <label key={permiso.id} className={`permisos-admin__permiso-fila ${permiso.activo ? 'permisos-admin__permiso-fila--activo' : ''}`}>
                    <div className="permisos-admin__checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        checked={permiso.activo}
                        onChange={() => togglePermiso(mIdx, pIdx)}
                        className="permisos-admin__checkbox"
                      />
                      <span className="permisos-admin__checkbox-custom">
                        {permiso.activo && <Check size={12} />}
                      </span>
                    </div>
                    <div className="permisos-admin__permiso-info">
                      <span className="permisos-admin__permiso-nombre">{permiso.nombre}</span>
                      <span className="permisos-admin__permiso-desc">{permiso.descripcion}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="permisos-admin__editor-pie">
          <div className="permisos-admin__help-text">
            <HelpCircle size={16} className="permisos-admin__help-icon" />
            <span>Los permisos dinámicos definitivos se integrarán utilizando la lista estructurada del cliente.</span>
          </div>
          <div className="permisos-admin__pie-botones">
            {guardadoExitoso && (
              <span className="toast-guardado-simulado animate-fade-in">
                <Check size={14} /> Permisos guardados temporalmente
              </span>
            )}
            <Boton onClick={guardarCambiosSimulados}>
              Guardar permisos de {rolSeleccionado === 'super_admin' ? 'Super Admin' : rolSeleccionado === 'admin' ? 'Administrador' : 'Usuario'}
            </Boton>
          </div>
        </div>
      </div>
    </div>
  );
}
