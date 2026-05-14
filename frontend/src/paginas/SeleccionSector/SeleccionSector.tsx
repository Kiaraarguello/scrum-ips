import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Sector } from '../../tipos';
import { listarSectores } from '../../servicios/sectores';
import { actualizarSectorPropio } from '../../servicios/usuarios';
import { useAuth } from '../../contextos/ContextoAuth';
import Boton from '../../componentes/Boton/Boton';
import './SeleccionSector.css';

export default function SeleccionSector() {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [verTodos, setVerTodos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const { usuario, actualizarUsuario } = useAuth();
  const navegar = useNavigate();

  useEffect(() => {
    listarSectores().then((lista) => {
      const activos = lista.filter((s) => s.activo);
      setSectores(activos);
    });
  }, []);

  function toggleSeleccion(id: number) {
    if (id === 0) {
      setVerTodos(!verTodos);
      return;
    }
    setSeleccionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  async function confirmar() {
    if (seleccionados.length === 0 && !verTodos) return;
    setEnviando(true);
    try {
      const usuarioActualizado = await actualizarSectorPropio({ 
        sector_ids: seleccionados,
        ver_todos: verTodos 
      });
      actualizarUsuario(usuarioActualizado);
      navegar('/tablero');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="seleccion-sector">
      <div className="seleccion-sector__tarjeta">
        <h1 className="seleccion-sector__titulo">Elige tu sector de trabajo</h1>
        <p className="seleccion-sector__descripcion">Puedes elegir uno, varios o todos los sectores para filtrar el tablero</p>
        <div className="seleccion-sector__lista">
          {/* Opción virtual: Todos los sectores */}
          <button
            className={`seleccion-sector__opcion ${verTodos ? 'seleccion-sector__opcion--activo' : ''}`}
            onClick={() => toggleSeleccion(0)}
          >
            <span className="seleccion-sector__nombre">Todos los sectores</span>
            <span className="seleccion-sector__descripcion-sector">Ver tareas de todas las áreas (permanente)</span>
          </button>

          {sectores.map((sector) => (
            <button
              key={sector.id}
              className={`seleccion-sector__opcion ${seleccionados.includes(sector.id) ? 'seleccion-sector__opcion--activo' : ''}`}
              onClick={() => toggleSeleccion(sector.id)}
            >
              <span className="seleccion-sector__nombre">{sector.nombre}</span>
              {sector.descripcion && (
                <span className="seleccion-sector__descripcion-sector">{sector.descripcion}</span>
              )}
            </button>
          ))}
        </div>
        <Boton disabled={(seleccionados.length === 0 && !verTodos) || enviando} onClick={confirmar} className="seleccion-sector__boton">
          {enviando ? 'Guardando...' : 'Continuar al tablero'}
        </Boton>
      </div>
    </div>
  );
}
