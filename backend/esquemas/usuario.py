from pydantic import BaseModel, EmailStr
from datetime import datetime


class UsuarioCrear(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    rol: str = "usuario"
    sector_ids: list[int] = []


class UsuarioActualizar(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    rol: str | None = None
    sector_id: int | None = None
    sector_ids: list[int] | None = None
    ver_todos: bool | None = None
    seleccion_completada: bool | None = None
    activo: bool | None = None


class ActualizarPerfilPropio(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    email: EmailStr | None = None
    password: str | None = None


class ActualizarSectoresPropio(BaseModel):
    sector_ids: list[int]
    ver_todos: bool = False


class ActualizarSectorPropio(BaseModel):
    sector_ids: list[int]
    ver_todos: bool = False


class SectorSoloNombre(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class UsuarioSalida(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: str
    rol: str
    sector_id: int | None
    ver_todos: bool = False
    seleccion_completada: bool = False
    activo: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True


class UsuarioSalidaConSector(UsuarioSalida):
    sector: SectorSoloNombre | None = None
    sectores: list[SectorSoloNombre] = []
