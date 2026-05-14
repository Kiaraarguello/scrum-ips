from pydantic import BaseModel
from datetime import datetime


class SedeCrear(BaseModel):
    nombre: str
    ciudad: str
    direccion: str | None = None
    notas: str | None = None


class SedeActualizar(BaseModel):
    nombre: str | None = None
    ciudad: str | None = None
    direccion: str | None = None
    notas: str | None = None
    activo: bool | None = None


class SedeSalida(BaseModel):
    id: int
    nombre: str
    ciudad: str
    direccion: str | None
    notas: str | None
    activo: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True
