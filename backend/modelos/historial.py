from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from basedatos import Base


class HistorialTarea(Base):
    __tablename__ = "historial_tareas"

    id = Column(Integer, primary_key=True, index=True)
    tarea_id = Column(Integer, ForeignKey("tareas.id", ondelete="CASCADE"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)
    estado_anterior = Column(String(50), nullable=True)
    estado_nuevo = Column(String(50), nullable=False)
    fecha_movimiento = Column(DateTime, default=datetime.utcnow, nullable=False)

    tarea = relationship("Tarea", back_populates="historial")
    usuario = relationship("Usuario", back_populates="movimientos_historial")
