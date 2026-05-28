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

  // Estados para los filtros y paginación
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroSede, setFiltroSede] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroIngreso, setFiltroIngreso] = useState('todos');
  const [filtroCiudad, setFiltroCiudad] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);

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

  // Resetear a la página 1 cuando cambia algún filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroNombre, filtroSede, filtroEstado, filtroIngreso, filtroCiudad]);

  // Extraer lista única de ciudades registradas para el filtro
  const ciudadesDisponibles = Array.from(
    new Set(
      pcs
        .map((p) => p.ciudad?.trim())
        .filter((c): c is string => !!c)
    )
  ).sort();

  // Filtrado reactivo del lado del cliente
  const pcsFiltradas = pcs.filter((pc) => {
    // 1. Nombre interno (búsqueda manual parcial, case-insensitive)
    if (filtroNombre.trim()) {
      const q = filtroNombre.toLowerCase().trim();
      if (!pc.nombre_interno.toLowerCase().includes(q)) {
        return false;
      }
    }

    // 2. Sede
    if (filtroSede !== 'todos') {
      if (filtroSede === 'sin_sede') {
        if (pc.sede_id !== null && pc.sede_id !== undefined) {
          return false;
        }
      } else {
        if (pc.sede_id?.toString() !== filtroSede) {
          return false;
        }
      }
    }

    // 3. Estado
    if (filtroEstado !== 'todos' && pc.estado !== filtroEstado) {
      return false;
    }

    // 4. Ciudad
    if (filtroCiudad !== 'todos' && pc.ciudad?.trim() !== filtroCiudad) {
      return false;
    }

    // 5. Fecha de ingreso
    if (filtroIngreso !== 'todos') {
      const fechaIngreso = new Date(pc.fecha_ingreso);
      const hoy = new Date();
      const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

      if (filtroIngreso === 'hoy') {
        if (fechaIngreso < inicioHoy) return false;
      } else if (filtroIngreso === 'semana') {
        const haceUnaSemana = new Date(inicioHoy);
        haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
        if (fechaIngreso < haceUnaSemana) return false;
      } else if (filtroIngreso === 'mes') {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        if (fechaIngreso < inicioMes) return false;
      } else if (filtroIngreso === 'anio') {
        const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
        if (fechaIngreso < inicioAnio) return false;
      }
    }

    return true;
  });

  // Paginación
  const limitePorPagina = 20;
  const totalPaginas = Math.ceil(pcsFiltradas.length / limitePorPagina);
  const paginaSegura = paginaActual > totalPaginas ? Math.max(1, totalPaginas) : paginaActual;
  const indiceInicial = (paginaSegura - 1) * limitePorPagina;
  const pcsPaginadas = pcsFiltradas.slice(indiceInicial, indiceInicial + limitePorPagina);

  const irAPagina = (n: number) => {
    setPaginaActual(Math.max(1, Math.min(n, totalPaginas)));
  };

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

      {/* Contenedor de Filtros de Ancho Completo */}
      <div className="registro-pcs__filtros">
        <CampoTexto
          etiqueta="Buscar por nombre interno"
          id="filtro-nombre"
          placeholder="Escriba un nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />
        <Selector
          etiqueta="Filtrar por Sede"
          id="filtro-sede"
          value={filtroSede}
          onChange={(e) => setFiltroSede(e.target.value)}
          opciones={[
            { valor: 'todos', etiqueta: 'Todas las sedes' },
            { valor: 'sin_sede', etiqueta: 'Sin sede' },
            ...sedes.map((s) => ({ valor: s.id.toString(), etiqueta: s.nombre })),
          ]}
        />
        <Selector
          etiqueta="Filtrar por Estado"
          id="filtro-estado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          opciones={[
            { valor: 'todos', etiqueta: 'Todos los estados' },
            ...Object.entries(ETIQUETAS_ESTADO).map(([valor, etiqueta]) => ({ valor, etiqueta })),
          ]}
        />
        <Selector
          etiqueta="Filtrar por Ingreso"
          id="filtro-ingreso"
          value={filtroIngreso}
          onChange={(e) => setFiltroIngreso(e.target.value)}
          opciones={[
            { valor: 'todos', etiqueta: 'Cualquier fecha' },
            { valor: 'hoy', etiqueta: 'Hoy' },
            { valor: 'semana', etiqueta: 'Últimos 7 días' },
            { valor: 'mes', etiqueta: 'Este mes' },
            { valor: 'anio', etiqueta: 'Este año' },
          ]}
        />
        <Selector
          etiqueta="Filtrar por Ciudad"
          id="filtro-ciudad"
          value={filtroCiudad}
          onChange={(e) => setFiltroCiudad(e.target.value)}
          opciones={[
            { valor: 'todos', etiqueta: 'Todas las ciudades' },
            ...ciudadesDisponibles.map((c) => ({ valor: c, etiqueta: c })),
          ]}
        />
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
            {pcsPaginadas.map((pc) => (
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
        {pcsFiltradas.length === 0 && (
          <p className="registro-pcs__vacio">
            {pcs.length === 0 ? 'Sin PCs registradas' : 'No se encontraron PCs que coincidan con los filtros'}
          </p>
        )}

        {totalPaginas > 1 && (
          <div className="registro-pcs__paginacion">
            <div className="registro-pcs__paginacion-info">
              Mostrando <strong>{indiceInicial + 1}</strong> - <strong>{Math.min(indiceInicial + limitePorPagina, pcsFiltradas.length)}</strong> de <strong>{pcsFiltradas.length}</strong> PCs
            </div>
            <div className="registro-pcs__paginacion-controles">
              <Boton
                variante="secundario"
                onClick={() => irAPagina(paginaSegura - 1)}
                disabled={paginaSegura === 1}
                className="registro-pcs__paginacion-btn"
              >
                Anterior
              </Boton>
              
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <Boton
                  key={n}
                  variante={paginaSegura === n ? 'primario' : 'secundario'}
                  onClick={() => irAPagina(n)}
                  className={`registro-pcs__paginacion-btn ${paginaSegura === n ? 'registro-pcs__paginacion-btn--activa' : ''}`}
                >
                  {n}
                </Boton>
              ))}

              <Boton
                variante="secundario"
                onClick={() => irAPagina(paginaSegura + 1)}
                disabled={paginaSegura === totalPaginas}
                className="registro-pcs__paginacion-btn"
              >
                Siguiente
              </Boton>
            </div>
          </div>
        )}
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
