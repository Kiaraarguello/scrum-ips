import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Monitor, LayoutGrid, FolderKanban, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contextos/ContextoAuth';
import PanelNotificaciones from '../PanelNotificaciones/PanelNotificaciones';
import logoSiglas from '../../assets/logo-siglas.svg';
import './BarraNavegacion.css';

export default function BarraNavegacion() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  function manejarSalir() {
    cerrarSesion();
    navegar('/login');
  }

  return (
    <nav className="barra-navegacion">
      <div className="barra-navegacion__marca">
        <img src={logoSiglas} alt="IPS" className="barra-navegacion__logo-siglas" />
        <span className="barra-navegacion__logo">Scrum IPS</span>
      </div>

      <div className="barra-navegacion__enlaces">
        <NavLink to="/tablero" className={({ isActive }) => `barra-navegacion__enlace ${isActive ? 'barra-navegacion__enlace--activo' : ''}`}>
          <LayoutGrid size={16} />
          Tablero
        </NavLink>
        <NavLink to="/admin/backlog" className={({ isActive }) => `barra-navegacion__enlace ${isActive ? 'barra-navegacion__enlace--activo' : ''}`}>
          <FolderKanban size={16} />
          Backlog
        </NavLink>
        <NavLink to="/pcs" className={({ isActive }) => `barra-navegacion__enlace ${isActive ? 'barra-navegacion__enlace--activo' : ''}`}>
          <Monitor size={16} />
          PCs
        </NavLink>
        {['admin', 'super_admin', 'super_usuario'].includes(usuario?.rol || '') ? (
          <NavLink to="/admin" className={({ isActive }) => `barra-navegacion__enlace ${isActive ? 'barra-navegacion__enlace--activo' : ''}`}>
            <LayoutDashboard size={16} />
            Admin
          </NavLink>
        ) : (
          <NavLink to="/mi-panel" className={({ isActive }) => `barra-navegacion__enlace ${isActive ? 'barra-navegacion__enlace--activo' : ''}`}>
            <LayoutDashboard size={16} />
            Mi panel
          </NavLink>
        )}
        {usuario?.rol === 'super_usuario' && (
          <NavLink to="/admin/auditoria" className={({ isActive }) => `barra-navegacion__enlace ${isActive ? 'barra-navegacion__enlace--activo' : ''}`}>
            <ShieldAlert size={16} />
            Auditoría
          </NavLink>
        )}
      </div>

      <div className="barra-navegacion__acciones">
        <span className="barra-navegacion__usuario">{usuario?.nombre}</span>
        {['super_admin', 'super_usuario'].includes(usuario?.rol || '') && <PanelNotificaciones />}
        <button className="barra-navegacion__salir" onClick={manejarSalir} title="Cerrar sesion">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
