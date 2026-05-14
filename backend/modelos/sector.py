from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from basedatos import Base


class Sector(Base):
    __tablename__ = "sectores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(Text)
    activo = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Usuarios que tienen este sector como activo
    usuarios_activos = relationship("Usuario", foreign_keys="Usuario.sector_id", back_populates="sector")
    # Usuarios asignados a este sector (M2M)
    usuarios_asignados = relationship("Usuario", secondary="usuario_sectores", back_populates="sectores")

    tareas = relationship("Tarea", back_populates="sector")
