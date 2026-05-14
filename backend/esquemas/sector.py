from pydantic import BaseModel
from datetime import datetime


class SectorCrear(BaseModel):
    nombre: str
    descripcion: str | None = None


class SectorActualizar(BaseModel):
    nombre: str | None = None
    descripcion: str | None = None
    activo: bool | None = None


class SectorSalida(BaseModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True
