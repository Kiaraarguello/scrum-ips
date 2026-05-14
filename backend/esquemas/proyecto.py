from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ProyectoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    activo: bool = True

class ProyectoCreate(ProyectoBase):
    usuarios_ids: Optional[List[int]] = []

class UsuarioResumen(BaseModel):
    id: int
    nombre: str
    apellido: str
    rol: str

class Proyecto(ProyectoBase):
    id: int
    fecha_creacion: datetime
    usuarios: List[UsuarioResumen] = []

    class Config:
        from_attributes = True
