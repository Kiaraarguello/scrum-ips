import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, Search, X } from 'lucide-react';
import type { Sector } from '../../tipos';
import { listarSectores, crearSector, actualizarSector, eliminarSector } from '../../servicios/sectores';
import { ordenarPorNombre } from '../../utilidades/ordenAlfabetico';
import Boton from '../../componentes/Boton/Boton';
import CampoTexto from '../../componentes/CampoTexto/CampoTexto';
import './GestionSectores.css';

export default function GestionSectores() {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { listarSectores().then(setSectores); }, []);

  function abrirCrear() { setEditando(null); setNombre(''); setDescripcion(''); setMostrarForm(true); }

  function abrirEditar(s: Sector) { setEditando(s.id); setNombre(s.nombre); setDescripcion(s.descripcion ?? ''); setMostrarForm(true); }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (editando) {
      const act = await actualizarSector(editando, { nombre, descripcion });
      setSectores((prev) => ordenarPorNombre(prev.map((s) => (s.id === editando ? act : s))));
    } else {
      const nuevo = await crearSector({ nombre, descripcion });
      setSectores((prev) => ordenarPorNombre([...prev, nuevo]));
    }
    setMostrarForm(false);
  }

  async function borrar(id: number) {
    const confirmar = window.confirm('¿Estás seguro de que quieres eliminar este sector?');
    if (!confirmar) return;
    
    try {
      await eliminarSector(id);
      setSectores((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error al eliminar sector:', error);
    }
  }

  const sectoresFiltrados = ordenarPorNombre(sectores.filter((s) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;
    return (
      s.nombre.toLowerCase().includes(termino) ||
      (s.descripcion && s.descripcion.toLowerCase().includes(termino))
    );
  }));

  return (
    <div className="gestion-sectores pagina pagina--centrada">
      <Link to="/admin" className="btn-volver">
        <ArrowLeft size={18} />
        Volver al Panel Admin
      </Link>
      <div className="gestion-sectores__cabecera">
        <h1 className="gestion-sectores__titulo">Sectores</h1>
        <Boton onClick={abrirCrear}><Plus size={16} /> Nuevo sector</Boton>
      </div>

      <div className="busqueda-contenedor">
        <Search className="busqueda-icono" size={18} />
        <input
          type="text"
          placeholder="Buscar sectores por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="busqueda-input"
        />
        {busqueda && (
          <button type="button" onClick={() => setBusqueda('')} className="busqueda-limpiar" aria-label="Limpiar búsqueda">
            <X size={16} />
          </button>
        )}
      </div>

      {mostrarForm && (
        <div className="modal-formulario__fondo" onClick={() => setMostrarForm(false)}>
          <form onSubmit={guardar} className="modal-formulario__caja" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-formulario__titulo">{editando ? 'Editar Sector' : 'Nuevo Sector'}</h2>
            <div className="modal-formulario__campos">
              <CampoTexto etiqueta="Nombre" id="nombre-sector" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              <CampoTexto etiqueta="Descripcion (opcional)" id="desc-sector" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
            <div className="gestion-sectores__acciones">
              <Boton type="button" variante="secundario" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
              <Boton type="submit">{editando ? 'Guardar' : 'Crear'}</Boton>
            </div>
          </form>
        </div>
      )}

      <div className="gestion-sectores__lista">
        {sectoresFiltrados.length === 0 ? (
          <p className="gestion-sectores__no-resultados">
            No se encontraron sectores que coincidan con la búsqueda.
          </p>
        ) : (
          sectoresFiltrados.map((s) => (
            <div key={s.id} className="gestion-sectores__item">
              <div>
                <p className="gestion-sectores__nombre">{s.nombre}</p>
                {s.descripcion && <p className="gestion-sectores__descripcion">{s.descripcion}</p>}
              </div>
              <div className="gestion-sectores__acciones-item">
                <Boton variante="fantasma" onClick={() => abrirEditar(s)}><Pencil size={18} /></Boton>
                <Boton variante="peligro" onClick={() => borrar(s.id)}><Trash2 size={18} /></Boton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
