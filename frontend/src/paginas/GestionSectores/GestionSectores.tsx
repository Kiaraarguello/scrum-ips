import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import type { Sector } from '../../tipos';
import { listarSectores, crearSector, actualizarSector, eliminarSector } from '../../servicios/sectores';
import Boton from '../../componentes/Boton/Boton';
import CampoTexto from '../../componentes/CampoTexto/CampoTexto';
import './GestionSectores.css';

export default function GestionSectores() {
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => { listarSectores().then(setSectores); }, []);

  function abrirCrear() { setEditando(null); setNombre(''); setDescripcion(''); setMostrarForm(true); }

  function abrirEditar(s: Sector) { setEditando(s.id); setNombre(s.nombre); setDescripcion(s.descripcion ?? ''); setMostrarForm(true); }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (editando) {
      const act = await actualizarSector(editando, { nombre, descripcion });
      setSectores((prev) => prev.map((s) => (s.id === editando ? act : s)));
    } else {
      const nuevo = await crearSector({ nombre, descripcion });
      setSectores((prev) => [...prev, nuevo]);
    }
    setMostrarForm(false);
  }

  async function borrar(id: number) {
    await eliminarSector(id);
    setSectores((prev) => prev.filter((s) => s.id !== id));
  }

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

      {mostrarForm && (
        <form onSubmit={guardar} className="gestion-sectores__formulario">
          <CampoTexto etiqueta="Nombre" id="nombre-sector" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <CampoTexto etiqueta="Descripcion (opcional)" id="desc-sector" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <div className="gestion-sectores__acciones">
            <Boton type="button" variante="secundario" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
            <Boton type="submit">{editando ? 'Guardar' : 'Crear'}</Boton>
          </div>
        </form>
      )}

      <div className="gestion-sectores__lista">
        {sectores.map((s) => (
          <div key={s.id} className="gestion-sectores__item">
            <div>
              <p className="gestion-sectores__nombre">{s.nombre}</p>
              {s.descripcion && <p className="gestion-sectores__descripcion">{s.descripcion}</p>}
            </div>
            <div className="gestion-sectores__acciones-item">
              <Boton variante="fantasma" onClick={() => abrirEditar(s)}><Pencil size={14} /></Boton>
              <Boton variante="peligro" onClick={() => borrar(s.id)}><Trash2 size={14} /></Boton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
