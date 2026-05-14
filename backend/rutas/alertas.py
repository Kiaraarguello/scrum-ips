from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencias import obtener_db, requerir_admin
from modelos.alerta import AlertaAdmin
from modelos.usuario import Usuario
from esquemas.alerta import AlertaSalida

router = APIRouter(prefix="/alertas", tags=["alertas"])


@router.get("", response_model=list[AlertaSalida])
def listar_alertas(
    solo_no_leidas: bool = False,
    db: Session = Depends(obtener_db),
    _: Usuario = Depends(requerir_admin),
):
    query = db.query(AlertaAdmin)
    if solo_no_leidas:
        query = query.filter(AlertaAdmin.leida == False)
    return query.order_by(AlertaAdmin.fecha_creacion.desc()).limit(100).all()


@router.put("/{id}/marcar-leida", response_model=AlertaSalida)
def marcar_leida(id: int, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    alerta = db.query(AlertaAdmin).filter(AlertaAdmin.id == id).first()
    if alerta:
        alerta.leida = True
        db.commit()
        db.refresh(alerta)
    return alerta


@router.put("/marcar-todas-leidas", status_code=204)
def marcar_todas_leidas(db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    db.query(AlertaAdmin).filter(AlertaAdmin.leida == False).update({"leida": True})
    db.commit()
