import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProveedorAuth } from './contextos/ContextoAuth';
import { ProveedorNotificaciones } from './contextos/ContextoNotificaciones';
import RutaProtegida from './componentes/RutaProtegida/RutaProtegida';
import BarraNavegacion from './componentes/BarraNavegacion/BarraNavegacion';
import BannerIncognito from './componentes/BannerIncognito/BannerIncognito';
import Login from './paginas/Login/Login';
import SeleccionSector from './paginas/SeleccionSector/SeleccionSector';
import Tablero from './paginas/Tablero/Tablero';
import Pendiente from './paginas/Pendiente/Pendiente';
import MiPanel from './paginas/MiPanel/MiPanel';
import PanelAdmin from './paginas/PanelAdmin/PanelAdmin';
import GestionUsuarios from './paginas/GestionUsuarios/GestionUsuarios';
import GestionSectores from './paginas/GestionSectores/GestionSectores';
import GestionSedes from './paginas/GestionSedes/GestionSedes';
import HistorialTareas from './paginas/HistorialTareas/HistorialTareas';
import EstadisticasUsuarios from './paginas/EstadisticasUsuarios/EstadisticasUsuarios';
import RegistroPCs from './paginas/RegistroPCs/RegistroPCs';
import GestionBacklog from './paginas/GestionBacklog/GestionBacklog';
import ProyectoDetalle from './paginas/ProyectoDetalle/ProyectoDetalle';
import NoEncontrada from './paginas/NoEncontrada/NoEncontrada';
import SolicitudPublica from './paginas/SolicitudPublica/SolicitudPublica';
import PanelAuditoria from './paginas/PanelAuditoria/PanelAuditoria';
import AdministradorPermisos from './paginas/AdministradorPermisos/AdministradorPermisos';

function LayoutConBarra({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BarraNavegacion />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <ProveedorAuth>
      <ProveedorNotificaciones>
        <BrowserRouter>
          <BannerIncognito />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/seleccion-sector"
              element={
                <RutaProtegida>
                  <SeleccionSector />
                </RutaProtegida>
              }
            />
            <Route
              path="/tablero"
              element={
                <RutaProtegida>
                  <LayoutConBarra><Tablero /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/pendientes"
              element={
                <RutaProtegida>
                  <LayoutConBarra><Pendiente /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/mi-panel"
              element={
                <RutaProtegida>
                  <LayoutConBarra><MiPanel /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/pcs"
              element={
                <RutaProtegida>
                  <LayoutConBarra><RegistroPCs /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin"
              element={
                <RutaProtegida permisoRequerido="admin_panel">
                  <LayoutConBarra><PanelAdmin /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <RutaProtegida permisoRequerido="admin_usuarios">
                  <LayoutConBarra><GestionUsuarios /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/permisos"
              element={
                <RutaProtegida rolesPermitidos={['super_admin', 'super_usuario']}>
                  <LayoutConBarra><AdministradorPermisos /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/sectores"
              element={
                <RutaProtegida permisoRequerido="admin_sectores_sedes">
                  <LayoutConBarra><GestionSectores /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/sedes"
              element={
                <RutaProtegida permisoRequerido="admin_sectores_sedes">
                  <LayoutConBarra><GestionSedes /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/historial"
              element={
                <RutaProtegida permisoRequerido="admin_panel">
                  <LayoutConBarra><HistorialTareas /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/estadisticas"
              element={
                <RutaProtegida permisoRequerido="auditoria_stats">
                  <LayoutConBarra><EstadisticasUsuarios /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/auditoria"
              element={
                <RutaProtegida rolesPermitidos={['super_usuario']} permisoRequerido="auditoria_logs">
                  <LayoutConBarra><PanelAuditoria /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/backlog"
              element={
                <RutaProtegida>
                  <LayoutConBarra><GestionBacklog /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/backlog/:id"
              element={
                <RutaProtegida>
                  <LayoutConBarra><ProyectoDetalle /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route path="/solicitar" element={<SolicitudPublica />} />
            <Route path="/" element={<Login />} />
            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        </BrowserRouter>
      </ProveedorNotificaciones>
    </ProveedorAuth>
  );
}
