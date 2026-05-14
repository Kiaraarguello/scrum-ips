from pydantic import BaseModel
from datetime import datetime


class HistorialSalida(BaseModel):
    id: int
    tarea_id: int
    usuario_id: int
    estado_anterior: str | None
    estado_nuevo: str
    fecha_movimiento: datetime
    usuario: "UsuarioResumenHistorial | None" = None
    tarea: "TareaResumenHistorial | None" = None

    class Config:
        from_attributes = True


class UsuarioResumenHistorial(BaseModel):
    id: int
    nombre: str
    apellido: str

    class Config:
        from_attributes = True


class TareaResumenHistorial(BaseModel):
    id: int
    titulo: str

    class Config:
        from_attributes = True


HistorialSalida.model_rebuild()
