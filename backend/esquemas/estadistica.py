from pydantic import BaseModel


class ItemRankingUsuario(BaseModel):
    usuario_id: int
    nombre: str
    apellido: str
    puntos: int
    tareas_finalizadas: int


class RankingUsuariosSalida(BaseModel):
    ranking: list[ItemRankingUsuario]


class ResumenPropio(BaseModel):
    en_proceso: int
    finalizadas_7_dias: int
    finalizadas_total: int
    ultimas_finalizadas: list[dict]


class KpisUsuario(BaseModel):
    usuario_id: int
    nombre: str
    apellido: str
    puntos: int
    tareas_finalizadas: int
    tareas_en_proceso: int
    tareas_por_hacer: int
    promedio_respuesta_horas: float | None  # fecha_creacion → fecha_inicio
    promedio_resolucion_horas: float | None  # fecha_inicio → fecha_finalizacion
    tareas_alta: int
    tareas_media: int
    tareas_baja: int
    pct_alta: float


class KpisUsuariosSalida(BaseModel):
    usuarios: list[KpisUsuario]
