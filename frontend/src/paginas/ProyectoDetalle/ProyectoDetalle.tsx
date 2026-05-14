import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Tablero from '../Tablero/Tablero';
import { listarProyectos, type Proyecto } from '../../servicios/proyectos';

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

  return (
    <div className="proyecto-detalle">
      <div className="pagina" style={{ paddingBottom: 0 }}>
        <Link to="/admin/backlog" className="gestion-backlog__enlace" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '1rem' }}>
          <ChevronLeft size={16} />
          Volver al Backlog
        </Link>
      </div>
      <Tablero 
        proyectoId={proyecto.id} 
        tituloPersonalizado={`Proyecto: ${proyecto.nombre}`} 
      />
    </div>
  );
}
