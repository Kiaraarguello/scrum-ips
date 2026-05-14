import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
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
        {sedes.map((s) => (
          <div key={s.id} className="gestion-sedes__item">
            <div>
              <p className="gestion-sedes__nombre">{s.nombre}</p>
              <p className="gestion-sedes__detalle">{s.ciudad}{s.direccion ? ` - ${s.direccion}` : ''}</p>
            </div>
            <div className="gestion-sedes__acciones-item">
              <Boton variante="fantasma" onClick={() => abrirEditar(s)}><Pencil size={14} /></Boton>
              <Boton variante="peligro" onClick={() => borrar(s.id)}><Trash2 size={14} /></Boton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
