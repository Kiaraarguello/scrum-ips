from pydantic import BaseModel
from datetime import datetime


class PcCrear(BaseModel):
    nombre_interno: str
    descripcion: str | None = None
    ciudad: str | None = None
    sede_id: int | None = None
    propietario: str | None = None
    notas: str | None = None


class PcActualizar(BaseModel):
    nombre_interno: str | None = None
    descripcion: str | None = None
    ciudad: str | None = None
    sede_id: int | None = None
    propietario: str | None = None
    fecha_salida: datetime | None = None
    estado: str | None = None
    notas: str | None = None


class SedeResumenPc(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class PcSalida(BaseModel):
    id: int
    nombre_interno: str
    descripcion: str | None
    ciudad: str | None
    sede_id: int | None
    propietario: str | None
    fecha_ingreso: datetime
    fecha_salida: datetime | None
    estado: str
    notas: str | None
    sede: SedeResumenPc | None = None

    class Config:
        from_attributes = True
