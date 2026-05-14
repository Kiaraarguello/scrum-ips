import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProveedorAuth } from './contextos/ContextoAuth';
import { ProveedorNotificaciones } from './contextos/ContextoNotificaciones';
import RutaProtegida from './componentes/RutaProtegida/RutaProtegida';
import BarraNavegacion from './componentes/BarraNavegacion/BarraNavegacion';
import Login from './paginas/Login/Login';
import SeleccionSector from './paginas/SeleccionSector/SeleccionSector';
import Tablero from './paginas/Tablero/Tablero';
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
                <RutaProtegida soloAdmin>
                  <LayoutConBarra><PanelAdmin /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <RutaProtegida soloAdmin>
                  <LayoutConBarra><GestionUsuarios /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/sectores"
              element={
                <RutaProtegida soloAdmin>
                  <LayoutConBarra><GestionSectores /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/sedes"
              element={
                <RutaProtegida soloAdmin>
                  <LayoutConBarra><GestionSedes /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/historial"
              element={
                <RutaProtegida soloAdmin>
                  <LayoutConBarra><HistorialTareas /></LayoutConBarra>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/estadisticas"
              element={
                <RutaProtegida soloAdmin>
                  <LayoutConBarra><EstadisticasUsuarios /></LayoutConBarra>
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
