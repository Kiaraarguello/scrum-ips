import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { PcRegistro, Sede } from '../../tipos';
import { listarPcs, crearPc, actualizarPc, eliminarPc } from '../../servicios/pcs';
import { listarSedes } from '../../servicios/sedes';
import { useAuth } from '../../contextos/ContextoAuth';
import { formatearFecha } from '../../utilidades/formatoFecha';
import Boton from '../../componentes/Boton/Boton';
import CampoTexto from '../../componentes/CampoTexto/CampoTexto';
import Selector from '../../componentes/Selector/Selector';
import ModalEditarPC from '../../componentes/ModalEditarPC/ModalEditarPC';
import './RegistroPCs.css';

interface FormPc {
  nombre_interno: string;
  descripcion: string;
  ciudad: string;
  sede_id: string;
  propietario: string;
  notas: string;
}
const VACIO: FormPc = { nombre_interno: '', propietario: '', descripcion: '', ciudad: '', sede_id: '', notas: '' };

const ETIQUETAS_ESTADO: Record<string, string> = {
  llegada: 'Llegada',
  en_proceso: 'En proceso',
  para_entregar: 'Listo para entregar',
  entregada: 'Entregada',
};

export default function RegistroPCs() {
  const { usuario } = useAuth();
  const [pcs, setPcs] = useState<PcRegistro[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pcParaEditar, setPcParaEditar] = useState<PcRegistro | null>(null);
  const [form, setForm] = useState<FormPc>(VACIO);

  const ordenarPcs = (lista: PcRegistro[]) => {
    const PESO_ESTADO: Record<string, number> = {
      llegada: 1,
      en_proceso: 2,
      para_entregar: 3,
      entregada: 4,
    };
    return [...lista].sort((a, b) => {
      const pesoA = PESO_ESTADO[a.estado] ?? 99;
      const pesoB = PESO_ESTADO[b.estado] ?? 99;
      if (pesoA !== pesoB) return pesoA - pesoB;
      return new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime();
    });
  };

  useEffect(() => {
    listarPcs().then((lista) => setPcs(ordenarPcs(lista)));
    listarSedes().then(setSedes);
  }, []);

  function abrirCrear() { setForm(VACIO); setMostrarForm(true); }
  function abrirEditar(pc: PcRegistro) {
    setPcParaEditar(pc);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, sede_id: form.sede_id ? Number(form.sede_id) : undefined };
    const nueva = await crearPc(payload);
    setPcs((prev) => ordenarPcs([nueva, ...prev]));
    setMostrarForm(false);
  }

  async function borrar(id: number) {
    await eliminarPc(id);
    setPcs((prev) => prev.filter((p) => p.id !== id));
  }

  async function marcarEntregada(pc: PcRegistro) {
    const act = await actualizarPc(pc.id, { estado: 'entregada', fecha_salida: new Date().toISOString() });
    setPcs((prev) => ordenarPcs(prev.map((p) => (p.id === pc.id ? act : p))));
  }

  const campo = (k: keyof FormPc) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [k]: e.target.value })),
  });

  return (
    <div className="registro-pcs">
      <div className="registro-pcs__cabecera">
        <h1 className="registro-pcs__titulo">Registro de PCs</h1>
        <Boton onClick={abrirCrear}><Plus size={16} /> Registrar PC</Boton>
      </div>

      {mostrarForm && (
        <form onSubmit={guardar} className="registro-pcs__formulario">
          <div className="registro-pcs__fila">
            <CampoTexto etiqueta="Nombre interno" id="nom-pc" {...campo('nombre_interno')} required />
            <CampoTexto etiqueta="Propietario" id="prop-pc" {...campo('propietario')} />
          </div>
          <CampoTexto etiqueta="Descripcion / problema" id="desc-pc" {...campo('descripcion')} />
          <div className="registro-pcs__fila">
            <CampoTexto etiqueta="Ciudad" id="ciu-pc" {...campo('ciudad')} />
            <Selector
              etiqueta="Sede"
              id="sede-pc"
              {...campo('sede_id')}
              opciones={[{ valor: '', etiqueta: 'Sin sede' }, ...sedes.map((s) => ({ valor: s.id, etiqueta: s.nombre }))]}
            />
          </div>
          <CampoTexto etiqueta="Notas internas" id="not-pc" {...campo('notas')} />
          <div className="registro-pcs__acciones">
            <Boton type="button" variante="secundario" onClick={() => setMostrarForm(false)}>Cancelar</Boton>
            <Boton type="submit">Registrar</Boton>
          </div>
        </form>
      )}

      <div className="registro-pcs__tabla-envolvente">
        <table className="registro-pcs__tabla">
          <thead>
            <tr><th>Nombre</th><th>Propietario</th><th>Sede</th><th>Ingreso</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {pcs.map((pc) => (
              <tr key={pc.id}>
                <td>
                  <p className="registro-pcs__nombre">{pc.nombre_interno}</p>
                  {pc.descripcion && <p className="registro-pcs__desc">{pc.descripcion}</p>}
                </td>
                <td>{pc.propietario ?? '-'}</td>
                <td>{pc.sede?.nombre ?? '-'}</td>
                <td>{formatearFecha(pc.fecha_ingreso)}</td>
                <td>
                  <span className={`registro-pcs__estado registro-pcs__estado--${pc.estado}`}>
                    {ETIQUETAS_ESTADO[pc.estado] ?? pc.estado}
                  </span>
                </td>
                <td className="registro-pcs__acciones-fila">
                  {pc.estado !== 'entregada' && (
                    <Boton variante="secundario" onClick={() => marcarEntregada(pc)}>Entregar</Boton>
                  )}
                  <Boton variante="fantasma" onClick={() => abrirEditar(pc)}><Pencil size={14} /></Boton>
                  {usuario?.rol === 'admin' && (
                    <Boton variante="peligro" onClick={() => borrar(pc.id)}><Trash2 size={14} /></Boton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pcs.length === 0 && <p className="registro-pcs__vacio">Sin PCs registradas</p>}
      </div>

      {pcParaEditar && (
        <ModalEditarPC
          pc={pcParaEditar}
          onCerrar={() => setPcParaEditar(null)}
          onActualizada={() => {
            setPcParaEditar(null);
            listarPcs().then((lista) => setPcs(ordenarPcs(lista)));
          }}
        />
      )}
    </div>
  );
}
