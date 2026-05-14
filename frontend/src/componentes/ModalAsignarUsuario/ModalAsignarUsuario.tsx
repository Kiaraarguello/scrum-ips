import { useState, useEffect } from 'react';
import type { Usuario } from '../../tipos';
import { listarUsuarios } from '../../servicios/usuarios';
import Selector from '../Selector/Selector';
import Boton from '../Boton/Boton';
import './ModalAsignarUsuario.css';

interface Props {
  sectorId: number;
  usuarioIdPrevio?: number | null;
  onConfirmar: (usuarioId: number) => void;
  onCancelar: () => void;
}

export default function ModalAsignarUsuario({ sectorId, usuarioIdPrevio, onConfirmar, onCancelar }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [seleccionado, setSeleccionado] = useState(usuarioIdPrevio?.toString() ?? '');

  useEffect(() => {
    listarUsuarios().then((lista) => {
      // Filtramos por sector y activos. 
      // Si el usuarioIdPrevio está en la lista pero no cumple el filtro (ej: es admin), lo incluimos igual para que no desaparezca.
      const filtrados = lista.filter((u) => 
        (u.sector_id === sectorId && u.activo && u.rol === 'usuario') || 
        (u.id === usuarioIdPrevio)
      );
      setUsuarios(filtrados);
    });
  }, [sectorId, usuarioIdPrevio]);

  return (
    <div className="modal-asignar__fondo" onClick={onCancelar}>
      <div className="modal-asignar__caja" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-asignar__titulo">Asignar usuario</h3>
        <p className="modal-asignar__descripcion">Selecciona quien tomara esta tarea</p>
        <Selector
          etiqueta="Usuario"
          id="usuario-asignar"
          value={seleccionado}
          onChange={(e) => setSeleccionado(e.target.value)}
          opciones={[
            { valor: '', etiqueta: 'Sin asignar' },
            ...usuarios.map((u) => ({ valor: u.id.toString(), etiqueta: u.nombre })),
          ]}
        />
        <div className="modal-asignar__acciones">
          <Boton variante="secundario" onClick={onCancelar}>Cancelar</Boton>
          <Boton
            onClick={() => onConfirmar(Number(seleccionado))}
            disabled={!seleccionado}
          >
            Confirmar
          </Boton>
        </div>
      </div>
    </div>
  );
}
