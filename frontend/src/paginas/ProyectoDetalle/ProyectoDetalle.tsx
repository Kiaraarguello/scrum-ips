import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, Users } from 'lucide-react';
import Tablero from '../Tablero/Tablero';
import { listarProyectos, type Proyecto } from '../../servicios/proyectos';
import './ProyectoDetalle.css';

function colorAvatar(texto: string) {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = texto.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash % 360)}, 60%, 42%)`;
}

export default function ProyectoDetalle() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);

  useEffect(() => {
    if (id) {
      listarProyectos().then(proyectos => {
        const p = proyectos.find(item => item.id === Number(id));
        if (p) setProyecto(p);
      });
    }
  }, [id]);

  if (!proyecto) return <div className="pagina">Cargando proyecto...</div>;

  const miembros = proyecto.usuarios ?? [];

  return (
    <div className="proyecto-detalle">
      <div className="pagina proyecto-detalle__cabecera-pagina">
        <Link to="/admin/backlog" className="gestion-backlog__enlace proyecto-detalle__volver">
          <ChevronLeft size={16} />
          Volver al Backlog
        </Link>

        {miembros.length > 0 && (
          <div className="proyecto-detalle__miembros">
            <div className="proyecto-detalle__miembros-titulo">
              <Users size={16} />
              <span>Miembros del proyecto ({miembros.length})</span>
            </div>
            <div className="proyecto-detalle__miembros-lista">
              {miembros.map((m) => {
                const iniciales = `${m.nombre.charAt(0)}${m.apellido.charAt(0)}`.toUpperCase();
                return (
                  <div key={m.id} className="proyecto-detalle__miembro" title={`${m.nombre} ${m.apellido}`}>
                    <div
                      className="proyecto-detalle__miembro-avatar"
                      style={{ backgroundColor: colorAvatar(m.nombre + m.apellido) }}
                    >
                      {iniciales}
                    </div>
                    <span className="proyecto-detalle__miembro-nombre">{m.nombre} {m.apellido}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Tablero
        proyectoId={proyecto.id}
        tituloPersonalizado={`Proyecto: ${proyecto.nombre}`}
        miembrosProyecto={miembros}
      />
    </div>
  );
}
