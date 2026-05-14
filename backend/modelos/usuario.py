from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from basedatos import Base
# Importación diferida para evitar ciclos
# from modelos.proyecto import proyecto_usuarios


usuario_sectores = Table(
    "usuario_sectores",
    Base.metadata,
    Column("usuario_id", Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), primary_key=True),
    Column("sector_id", Integer, ForeignKey("sectores.id", ondelete="CASCADE"), primary_key=True),
)


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(Enum("admin", "usuario"), nullable=False, default="usuario")
    sector_id = Column(Integer, ForeignKey("sectores.id", ondelete="SET NULL"), nullable=True)
    ver_todos = Column(Boolean, default=False, nullable=False)
    seleccion_completada = Column(Boolean, default=False, nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Sector activo (para el tablero)
    sector = relationship("Sector", foreign_keys=[sector_id], back_populates="usuarios_activos")
    # Sectores asignados (M2M)
    sectores = relationship("Sector", secondary=usuario_sectores, back_populates="usuarios_asignados")

    tareas_creadas = relationship("Tarea", foreign_keys="Tarea.creada_por", back_populates="creador")
    tareas_asignadas = relationship("Tarea", foreign_keys="Tarea.asignado_a", back_populates="asignado")
    movimientos_historial = relationship("HistorialTarea", back_populates="usuario")
    proyectos = relationship("Proyecto", secondary="proyecto_usuarios", back_populates="usuarios")
