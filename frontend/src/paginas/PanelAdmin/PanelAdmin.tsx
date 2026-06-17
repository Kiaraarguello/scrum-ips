import { Link } from 'react-router-dom';
import { Users, Layers, Building2, History, BarChart2, FolderKanban, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contextos/ContextoAuth';
import { esSuperUsuario, tienePermiso } from '../../utilidades/permisos';
import './PanelAdmin.css';

const ACCESOS = [
  { ruta: '/admin/usuarios', icono: Users, titulo: 'Usuarios', descripcion: 'Gestionar usuarios del sistema' },
  { ruta: '/admin/sectores', icono: Layers, titulo: 'Sectores', descripcion: 'Equipos de trabajo' },
  { ruta: '/admin/sedes', icono: Building2, titulo: 'Sedes', descripcion: 'Edificios de la empresa' },
  { ruta: '/admin/historial', icono: History, titulo: 'Historial', descripcion: 'Movimientos de tareas' },
  { ruta: '/admin/estadisticas', icono: BarChart2, titulo: 'Estadisticas', descripcion: 'Ranking de productividad' },
  { ruta: '/admin/backlog', icono: FolderKanban, titulo: 'Backlog', descripcion: 'Gestionar proyectos y tareas externas' },
  { ruta: '/admin/auditoria', icono: ShieldAlert, titulo: 'Auditoría', descripcion: 'Quién hizo cada cambio, cuándo y dónde' },
];

export default function PanelAdmin() {
  const { usuario } = useAuth();
  
  const accesosFiltrados = ACCESOS.filter(acceso => {
    if (esSuperUsuario(usuario?.rol)) return true;

    if (acceso.ruta === '/admin/usuarios') {
      return tienePermiso(usuario, 'admin_usuarios');
    }
    if (acceso.ruta === '/admin/sectores' || acceso.ruta === '/admin/sedes') {
      return tienePermiso(usuario, 'admin_sectores_sedes');
    }
    if (acceso.ruta === '/admin/estadisticas') {
      return tienePermiso(usuario, 'auditoria_stats');
    }
    if (acceso.ruta === '/admin/historial') {
      return tienePermiso(usuario, 'admin_panel');
    }
    if (acceso.ruta === '/admin/backlog') {
      return tienePermiso(usuario, 'tablero_ver');
    }
    if (acceso.ruta === '/admin/auditoria') {
      return tienePermiso(usuario, 'auditoria_logs');
    }
    return true;
  });

  return (
    <div className="panel-admin pagina pagina--centrada">
      <h1 className="panel-admin__titulo">Panel de Administración</h1>
      <div className="panel-admin__grilla">
        {accesosFiltrados.map(({ ruta, icono: Icono, titulo, descripcion }) => (
          <Link key={ruta} to={ruta} className="panel-admin__tarjeta">
            <div className="panel-admin__icono-envolvente">
              <Icono size={28} />
            </div>
            <div className="panel-admin__info">
              <span className="panel-admin__nombre">{titulo}</span>
              <span className="panel-admin__descripcion">{descripcion}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
