import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCheck } from 'lucide-react';
import { useNotificaciones } from '../../contextos/ContextoNotificaciones';
import { tiempoRelativo } from '../../utilidades/formatoFecha';
import Boton from '../Boton/Boton';
import './PanelNotificaciones.css';

export default function PanelNotificaciones() {
  const { alertas, cantidadNoLeidas, panelAbierto, abrirPanel, cerrarPanel, marcarLeida, marcarTodas } =
    useNotificaciones();
  const navegar = useNavigate();

  function manejarClickAlerta(alertaId: number, tareaId: number | null) {
    marcarLeida(alertaId);
    if (tareaId) {
      navegar(`/admin/historial?tarea_id=${tareaId}`);
      cerrarPanel();
    }
  }

  return (
    <>
      <button className="panel-notificaciones__boton-campana" onClick={panelAbierto ? cerrarPanel : abrirPanel}>
        <Bell size={20} />
        {cantidadNoLeidas > 0 && (
          <span className="panel-notificaciones__badge">{cantidadNoLeidas}</span>
        )}
      </button>

      {panelAbierto && (
        <div className="panel-notificaciones__overlay" onClick={cerrarPanel} />
      )}

      <div className={`panel-notificaciones__drawer ${panelAbierto ? 'panel-notificaciones__drawer--abierto' : ''}`}>
        <div className="panel-notificaciones__cabecera">
          <h3 className="panel-notificaciones__titulo">Notificaciones</h3>
          <div className="panel-notificaciones__acciones-cabecera">
            {cantidadNoLeidas > 0 && (
              <button className="panel-notificaciones__marcar-todas" onClick={marcarTodas} title="Marcar todas como leidas">
                <CheckCheck size={16} />
              </button>
            )}
            <button className="panel-notificaciones__cerrar" onClick={cerrarPanel}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="panel-notificaciones__lista">
          {alertas.length === 0 ? (
            <p className="panel-notificaciones__vacia">Sin alertas nuevas</p>
          ) : (
            alertas.map((alerta) => (
              <div
                key={alerta.id}
                className="panel-notificaciones__item"
                onClick={() => manejarClickAlerta(alerta.id, alerta.tarea_id)}
              >
                <p className="panel-notificaciones__mensaje">{alerta.mensaje}</p>
                <span className="panel-notificaciones__hora">{tiempoRelativo(alerta.fecha_creacion)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
