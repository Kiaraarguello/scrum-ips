import { useState, useEffect } from 'react';
import type { Usuario } from '../../tipos';
import { listarUsuarios } from '../../servicios/usuarios';
import Boton from '../Boton/Boton';
import { Check } from 'lucide-react';
import { useAuth } from '../../contextos/ContextoAuth';
import './ModalAsignarUsuario.css';

interface Props {
  sectorId: number;
  usuarioIdsPrevios?: number[];
  onConfirmar: (usuarioIds: number[]) => void;
  onCancelar: () => void;
}

export default function ModalAsignarUsuario({ sectorId, usuarioIdsPrevios = [], onConfirmar, onCancelar }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>(usuarioIdsPrevios);
  const { usuario: usuarioLogueado } = useAuth();

  useEffect(() => {
    listarUsuarios().then((lista) => {
      // Filtramos por sector y activos, incluyendo también a quienes tienen 'ver_todos' habilitado,
      // a quienes tienen el sector en sus sectores adicionales, o quienes pertenecen al sector especial "Todos los sectores",
      // y permitimos tanto rol 'usuario' como 'admin'.
      // También incluimos cualquier usuario previamente asignado para evitar que desaparezca de la lista.
      const filtrados = lista.filter((u) => 
        ((
          u.sector_id === sectorId || 
          u.ver_todos || 
          u.sectores?.some((s) => s.id === sectorId) ||
          u.sector?.nombre?.toLowerCase() === 'todos los sectores' ||
          u.sectores?.some((s) => s.nombre?.toLowerCase() === 'todos los sectores')
        ) && u.activo) || 
        (usuarioIdsPrevios.includes(u.id))
      );

      // Ordenamos la lista:
      // 1. Primero el usuario de la cuenta logueado actualmente
      // 2. Después los demás usuarios (rol 'usuario')
      // 3. Al final los administradores (rol 'admin')
      const ordenados = [...filtrados].sort((a, b) => {
        const idActual = usuarioLogueado?.id;
        
        // 1. Usuario actual primero
        if (a.id === idActual && b.id !== idActual) return -1;
        if (b.id === idActual && a.id !== idActual) return 1;
        
        // 2. Rol 'usuario' antes que 'admin'
        if (a.rol === 'usuario' && b.rol === 'admin') return -1;
        if (a.rol === 'admin' && b.rol === 'usuario') return 1;
        
        // 3. Orden alfabético secundario por nombre y apellido
        const nombreA = `${a.nombre} ${a.apellido}`.toLowerCase();
        const nombreB = `${b.nombre} ${b.apellido}`.toLowerCase();
        return nombreA.localeCompare(nombreB);
      });

      setUsuarios(ordenados);
    });
  }, [sectorId, usuarioIdsPrevios, usuarioLogueado]);

  useEffect(() => {
    setSeleccionados(usuarioIdsPrevios);
  }, [usuarioIdsPrevios]);

  const toggleUsuario = (id: number) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const obtenerIniciales = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const obtenerColorAvatar = (texto: string) => {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      hash = texto.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 42%)`;
  };

  return (
    <div className="modal-asignar__fondo animate-fade-in" onClick={onCancelar}>
      <div className="modal-asignar__caja modern-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-asignar__titulo">Asignar Equipo</h3>
        <p className="modal-asignar__descripcion">Selecciona uno o más usuarios para realizar esta tarea</p>
        
        <div className="modal-asignar__lista">
          {usuarios.length === 0 ? (
            <p className="modal-asignar__vacio">No hay usuarios disponibles en este sector.</p>
          ) : (
            usuarios.map((u) => {
              const estaSeleccionado = seleccionados.includes(u.id);
              const initials = obtenerIniciales(u.nombre, u.apellido);
              const avatarColor = obtenerColorAvatar(u.nombre + u.apellido);
              
              return (
                <div 
                  key={u.id} 
                  className={`modal-asignar__item ${estaSeleccionado ? 'modal-asignar__item--seleccionado' : ''}`}
                  onClick={() => toggleUsuario(u.id)}
                >
                  <div className="modal-asignar__avatar" style={{ backgroundColor: avatarColor }}>
                    {initials}
                  </div>
                  <div className="modal-asignar__info">
                    <span className="modal-asignar__nombre">{u.nombre} {u.apellido}</span>
                    {((usuarioLogueado?.rol === 'admin') || (u.id === usuarioLogueado?.id)) ? (
                      <span className="modal-asignar__email">{u.email}</span>
                    ) : (
                      <span className="modal-asignar__email">
                        {u.ver_todos ? 'Todos los sectores' : u.sector?.nombre || 'Sin sector'}
                      </span>
                    )}
                  </div>
                  <div className={`modal-asignar__checkbox-custom ${estaSeleccionado ? 'modal-asignar__checkbox-custom--activo' : ''}`}>
                    {estaSeleccionado && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="modal-asignar__acciones">
          <Boton variante="secundario" onClick={onCancelar}>Cancelar</Boton>
          <Boton
            onClick={() => onConfirmar(seleccionados)}
            variante="primario"
          >
            Confirmar ({seleccionados.length})
          </Boton>
        </div>
      </div>
    </div>
  );
}
