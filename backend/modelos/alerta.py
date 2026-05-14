from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from basedatos import Base


class AlertaAdmin(Base):
    __tablename__ = "alertas_admin"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(Enum("tarea_creada", "tarea_movida", "pc_ingresada"), nullable=False)
    mensaje = Column(String(500), nullable=False)
    tarea_id = Column(Integer, ForeignKey("tareas.id", ondelete="SET NULL"), nullable=True)
    pc_id = Column(Integer, ForeignKey("pcs_registro.id", ondelete="SET NULL"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    leida = Column(Boolean, default=False, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
