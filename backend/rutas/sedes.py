from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencias import obtener_db, obtener_usuario_actual, requerir_admin
from modelos.sede import Sede
from modelos.usuario import Usuario
from esquemas.sede import SedeCrear, SedeActualizar, SedeSalida

router = APIRouter(prefix="/sedes", tags=["sedes"])


@router.get("", response_model=list[SedeSalida])
def listar_sedes(db: Session = Depends(obtener_db), _: Usuario = Depends(obtener_usuario_actual)):
    return db.query(Sede).all()


@router.post("", response_model=SedeSalida, status_code=201)
def crear_sede(datos: SedeCrear, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    sede = Sede(**datos.model_dump())
    db.add(sede)
    db.commit()
    db.refresh(sede)
    return sede


@router.put("/{id}", response_model=SedeSalida)
def actualizar_sede(
    id: int, datos: SedeActualizar, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)
):
    sede = db.query(Sede).filter(Sede.id == id).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(sede, campo, valor)
    db.commit()
    db.refresh(sede)
    return sede


@router.delete("/{id}", status_code=204)
def eliminar_sede(id: int, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    sede = db.query(Sede).filter(Sede.id == id).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    sede.activo = False
    db.commit()
