from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from basedatos import Base


class PcRegistro(Base):
    __tablename__ = "pcs_registro"

    id = Column(Integer, primary_key=True, index=True)
    nombre_interno = Column(String(150), nullable=False)
    descripcion = Column(Text)
    ciudad = Column(String(100))
    sede_id = Column(Integer, ForeignKey("sedes.id", ondelete="SET NULL"), nullable=True)
    propietario = Column(String(150), nullable=True)
    fecha_ingreso = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_salida = Column(DateTime, nullable=True)
    estado = Column(Enum("en_taller", "entregada"), nullable=False, default="en_taller")
    notas = Column(Text, nullable=True)

    sede = relationship("Sede", back_populates="pcs")
