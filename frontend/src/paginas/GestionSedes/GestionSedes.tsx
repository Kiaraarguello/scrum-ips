import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, Search, X } from 'lucide-react';
import type { Sede } from '../../tipos';
import { listarSedes, crearSede, actualizarSede, eliminarSede } from '../../servicios/sedes';
import Boton from '../../componentes/Boton/Boton';
import CampoTexto from '../../componentes/CampoTexto/CampoTexto';
import './GestionSedes.css';

interface FormSede { nombre: string; ciudad: string; direccion: string; notas: string; }
const VACIO: FormSede = { nombre: '', ciudad: '', direccion: '', notas: '' };

export default function GestionSedes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [editando, setEditando] = useState<number | null>(null);
  const [form, setForm] = useState<FormSede>(VACIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => { listarSedes().then(setSedes); }, []);

  function abrirCrear() { setEditando(null); setForm(VACIO); setMostrarForm(true); }
  function abrirEditar(s: Sede) {
    setEditando(s.id);
    setForm({ nombre: s.nombre, ciudad: s.ciudad, direccion: s.direccion ?? '', notas: s.notas ?? '' });
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (editando) {
      const act = await actualizarSede(editando, form);
      setSedes((prev) => prev.map((s) => (s.id === editando ? act : s)));
    } else {
      const nueva = await crearSede(form);
      setSedes((prev) => [...prev, nueva]);
    }
    setMostrarForm(false);
  }

  async function borrar(id: number) {
    await eliminarSede(id);
    setSedes((prev) => prev.filter((s) => s.id !== id));
  }

  const campo = (k: keyof FormSede) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [k]: e.target.value })),
  });

  const sedesFiltradas = sedes.filter((s) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;
    return (
      s.nombre.toLowerCase().includes(termino) ||
      s.ciudad.toLowerCase().includes(termino) ||
      (s.direccion && s.direccion.toLowerCase().includes(termino)) ||
      (s.notas && s.notas.toLowerCase().includes(termino))
    );
  });

  return (
    <div className="gestion-sedes pagina pagina--centrada">
      <Link to="/admin" className="btn-volver">
        <ArrowLeft size={18} />
        Volver al Panel Admin
      </Link>
      <div className="gestion-sedes__cabecera">
        <h1 className="gestion-sedes__titulo">Sedes</h1>
        <Boton onClick={abrirCrear}><Plus size={16} /> Nueva sede</Boton>
      </div>

      <div className="busqueda-contenedor">
        <Search className="busqueda-icono" size={18} />
        <input
          type="text"
          placeholder="Buscar sedes por nombre, ciudad, dirección o notas..."
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
        <form onSubmit={guardar} className="gestion-sedes__formulario">
          <div className="gestion-sedes__fila">
            <CampoTexto etiqueta="Nombre" id="nom-sede" {...campo('nombre')} required />
            <CampoTexto etiqueta="Ciudad" id="ciu-sede" {...campo('ciudad')} required />
          </div>
          <CampoTexto etiqueta="Direccion" id="dir-sede" {...campo('direccion')} />
          <CampoTexto etiqueta="Notas" id="not-sede" {...campo('notas')} />
          <div className="gestion-sedes__acciones">
            <Boton type="button" variante="secundario" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
            <Boton type="submit">{editando ? 'Guardar' : 'Crear'}</Boton>
          </div>
        </form>
      )}

      <div className="gestion-sedes__lista">
        {sedesFiltradas.length === 0 ? (
          <p className="gestion-sedes__no-resultados">
            No se encontraron sedes que coincidan con la búsqueda.
          </p>
        ) : (
          sedesFiltradas.map((s) => (
            <div key={s.id} className="gestion-sedes__item">
              <div>
                <p className="gestion-sedes__nombre">{s.nombre}</p>
                <p className="gestion-sedes__detalle">{s.ciudad}{s.direccion ? ` - ${s.direccion}` : ''}</p>
              </div>
              <div className="gestion-sedes__acciones-item">
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
