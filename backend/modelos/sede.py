from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from basedatos import Base


class Sede(Base):
    __tablename__ = "sedes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), unique=True, nullable=False)
    ciudad = Column(String(100), nullable=False)
    direccion = Column(String(255))
    notas = Column(Text)
    activo = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)

    tareas = relationship("Tarea", back_populates="sede")
    pcs = relationship("PcRegistro", back_populates="sede")
