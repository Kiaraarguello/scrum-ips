from pydantic import BaseModel
from datetime import datetime


class TareaCrear(BaseModel):
    titulo: str
    nota_llamada: str | None = None
    criticidad: str = "baja"
    sector_id: int
    sede_id: int
    numero_contacto: str | None = None
    proyecto_id: int | None = None


class TareaActualizar(BaseModel):
    titulo: str | None = None
    nota_llamada: str | None = None
    criticidad: str | None = None
    sector_id: int | None = None
    sede_id: int | None = None
    numero_contacto: str | None = None


class TareaMover(BaseModel):
    nuevo_estado: str
    asignado_a: int | None = None


class UsuarioResumen(BaseModel):
    id: int
    nombre: str
    apellido: str

    class Config:
        from_attributes = True


class SectorResumen(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class SedeResumen(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class TareaSalida(BaseModel):
    id: int
    titulo: str
    nota_llamada: str | None
    criticidad: str
    estado: str
    sector_id: int
    sede_id: int
    numero_contacto: str | None
    creada_por: int
    asignado_a: int | None
    fecha_creacion: datetime
    fecha_inicio: datetime | None
    fecha_finalizacion: datetime | None
    sector: SectorResumen | None = None
    sede: SedeResumen | None = None
    creador: UsuarioResumen | None = None
    asignado: UsuarioResumen | None = None
    proyecto_id: int | None = None

    class Config:
        from_attributes = True
