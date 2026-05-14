from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from basedatos import Base


class Tarea(Base):
    __tablename__ = "tareas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    nota_llamada = Column(Text)
    criticidad = Column(Enum("alta", "media", "baja"), nullable=False, default="baja")
    estado = Column(Enum("por_hacer", "en_proceso", "finalizada"), nullable=False, default="por_hacer")
    sector_id = Column(Integer, ForeignKey("sectores.id", ondelete="RESTRICT"), nullable=False)
    sede_id = Column(Integer, ForeignKey("sedes.id", ondelete="RESTRICT"), nullable=False)
    numero_contacto = Column(String(50), nullable=True)
    creada_por = Column(Integer, ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)
    asignado_a = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    fecha_creacion = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    fecha_inicio = Column(DateTime, nullable=True)
    fecha_finalizacion = Column(DateTime, nullable=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id", ondelete="CASCADE"), nullable=True)
    activo = Column(Boolean, default=True, nullable=False)

    sector = relationship("Sector", back_populates="tareas")
    sede = relationship("Sede", back_populates="tareas")
    creador = relationship("Usuario", foreign_keys=[creada_por], back_populates="tareas_creadas")
    asignado = relationship("Usuario", foreign_keys=[asignado_a], back_populates="tareas_asignadas")
    proyecto = relationship("Proyecto", back_populates="tareas")
    historial = relationship("HistorialTarea", back_populates="tarea", cascade="all, delete")
