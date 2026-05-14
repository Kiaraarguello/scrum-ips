from pydantic import BaseModel
from datetime import datetime


class AlertaSalida(BaseModel):
    id: int
    tipo: str
    mensaje: str
    tarea_id: int | None
    pc_id: int | None
    usuario_id: int | None
    leida: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True
