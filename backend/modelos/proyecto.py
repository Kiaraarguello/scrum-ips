from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from basedatos import Base

# Tabla intermedia para la relación muchos a muchos entre Proyectos y Usuarios
proyecto_usuarios = Table(
    "proyecto_usuarios",
    Base.metadata,
    Column("proyecto_id", Integer, ForeignKey("proyectos.id", ondelete="CASCADE"), primary_key=True),
    Column("usuario_id", Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True),
)

class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)

    tareas = relationship("Tarea", back_populates="proyecto", cascade="all, delete")
    usuarios = relationship("Usuario", secondary=proyecto_usuarios, back_populates="proyectos")
