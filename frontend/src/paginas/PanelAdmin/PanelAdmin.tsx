import { Link } from 'react-router-dom';
import { Users, Layers, Building2, History, BarChart2, FolderKanban } from 'lucide-react';
import { useAuth } from '../../contextos/ContextoAuth';
import './PanelAdmin.css';

const ACCESOS = [
  { ruta: '/admin/usuarios', icono: Users, titulo: 'Usuarios', descripcion: 'Gestionar usuarios del sistema' },
  { ruta: '/admin/sectores', icono: Layers, titulo: 'Sectores', descripcion: 'Equipos de trabajo' },
  { ruta: '/admin/sedes', icono: Building2, titulo: 'Sedes', descripcion: 'Edificios de la empresa' },
  { ruta: '/admin/historial', icono: History, titulo: 'Historial', descripcion: 'Movimientos de tareas' },
  { ruta: '/admin/estadisticas', icono: BarChart2, titulo: 'Estadisticas', descripcion: 'Ranking de productividad' },
  { ruta: '/admin/backlog', icono: FolderKanban, titulo: 'Backlog', descripcion: 'Gestionar proyectos y tareas externas' },
];

export default function PanelAdmin() {
  const { usuario } = useAuth();
  
  const accesosFiltrados = ACCESOS.filter(acceso => {
    if (usuario?.rol === 'super_usuario') return true;

    if (acceso.ruta === '/admin/usuarios') {
      return usuario?.permisos?.admin_usuarios === true;
    }
    if (acceso.ruta === '/admin/sectores' || acceso.ruta === '/admin/sedes') {
      return usuario?.permisos?.admin_sectores_sedes === true;
    }
    if (acceso.ruta === '/admin/estadisticas') {
      return usuario?.permisos?.auditoria_stats === true;
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
