export interface Sector {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fecha_creacion: string;
}

export interface Sede {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string | null;
  notas: string | null;
  activo: boolean;
  fecha_creacion: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'super_usuario' | 'super_admin' | 'admin' | 'usuario';
  sector_id: number | null;
  ver_todos: boolean;
  seleccion_completada: boolean;
  activo: boolean;
  fecha_creacion: string;
  sector?: { id: number; nombre: string } | null;
  sectores?: { id: number; nombre: string }[];
  permisos?: Record<string, boolean>;
}

export type Criticidad = 'alta' | 'media' | 'baja';
export type EstadoTarea = 'por_hacer' | 'en_proceso' | 'finalizada' | 'pendiente';

export interface UsuarioResumen {
  id: number;
  nombre: string;
  apellido: string;
}

export interface SectorResumen {
  id: number;
  nombre: string;
}

export interface SedeResumen {
  id: number;
  nombre: string;
}

export interface Tarea {
  id: number;
  titulo: string;
  nota_llamada: string | null;
  criticidad: Criticidad;
  estado: EstadoTarea;
  sector_id: number;
  sede_id: number;
  numero_contacto: string | null;
  creada_por: number;
  asignado_a?: number | null;
  asignado_ids?: number[];
  proyecto_id: number | null;
  fecha_creacion: string;
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  solucion?: string | null;
  pendiente_descripcion?: string | null;
  activo: boolean;
  sector?: SectorResumen | null;
  sede?: SedeResumen | null;
  creador?: UsuarioResumen | null;
  asignado?: UsuarioResumen | null;
  asignados?: UsuarioResumen[];
}

export interface HistorialMovimiento {
  id: number;
  tarea_id: number;
  usuario_id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  fecha_movimiento: string;
  usuario?: UsuarioResumen | null;
  tarea?: { id: number; titulo: string } | null;
}

export interface PcRegistro {
  id: number;
  nombre_interno: string;
  descripcion: string | null;
  ciudad: string | null;
  sede_id: number | null;
  propietario: string | null;
  fecha_ingreso: string;
  fecha_salida: string | null;
  estado: 'llegada' | 'en_proceso' | 'para_entregar' | 'entregada';
  notas: string | null;
  sede?: SedeResumen | null;
}

export interface AlertaAdmin {
  id: number;
  tipo: 'tarea_creada' | 'tarea_movida' | 'pc_ingresada';
  mensaje: string;
  tarea_id: number | null;
  pc_id: number | null;
  usuario_id: number | null;
  leida: boolean;
  fecha_creacion: string;
}

export interface ItemRanking {
  usuario_id: number;
  nombre: string;
  apellido: string;
  puntos: number;
  tareas_finalizadas: number;
}

export interface ResumenPropio {
  en_proceso: number;
  finalizadas_7_dias: number;
  finalizadas_total: number;
  ultimas_finalizadas: Array<{ id: number; titulo: string; fecha: string }>;
}

export interface KpisUsuario {
  usuario_id: number;
  nombre: string;
  apellido: string;
  puntos: number;
  tareas_finalizadas: number;
  tareas_en_proceso: number;
  tareas_por_hacer: number;
  promedio_respuesta_horas: number | null;
  promedio_resolucion_horas: number | null;
  tareas_alta: number;
  tareas_media: number;
  tareas_baja: number;
  pct_alta: number;
}
