from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from dependencias import obtener_db, requerir_admin
from modelos.historial import HistorialTarea
from modelos.usuario import Usuario
from esquemas.historial import HistorialSalida

router = APIRouter(prefix="/historial", tags=["historial"])


@router.get("", response_model=list[HistorialSalida])
def listar_historial(
    usuario_id: int | None = None,
    tarea_id: int | None = None,
    desde: datetime | None = None,
    hasta: datetime | None = None,
    db: Session = Depends(obtener_db),
    _: Usuario = Depends(requerir_admin),
):
    query = db.query(HistorialTarea)
    if usuario_id:
        query = query.filter(HistorialTarea.usuario_id == usuario_id)
    if tarea_id:
        query = query.filter(HistorialTarea.tarea_id == tarea_id)
    if desde:
        query = query.filter(HistorialTarea.fecha_movimiento >= desde)
    if hasta:
        query = query.filter(HistorialTarea.fecha_movimiento <= hasta)
    return query.order_by(HistorialTarea.fecha_movimiento.desc()).all()
