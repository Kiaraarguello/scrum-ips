from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencias import obtener_db, obtener_usuario_actual, requerir_admin
from modelos.sector import Sector
from modelos.usuario import Usuario
from esquemas.sector import SectorCrear, SectorActualizar, SectorSalida

router = APIRouter(prefix="/sectores", tags=["sectores"])


@router.get("", response_model=list[SectorSalida])
def listar_sectores(db: Session = Depends(obtener_db), _: Usuario = Depends(obtener_usuario_actual)):
    return db.query(Sector).all()


@router.post("", response_model=SectorSalida, status_code=201)
def crear_sector(datos: SectorCrear, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    sector = Sector(**datos.model_dump())
    db.add(sector)
    db.commit()
    db.refresh(sector)
    return sector


@router.put("/{id}", response_model=SectorSalida)
def actualizar_sector(
    id: int, datos: SectorActualizar, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)
):
    sector = db.query(Sector).filter(Sector.id == id).first()
    if not sector:
        raise HTTPException(status_code=404, detail="Sector no encontrado")
    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(sector, campo, valor)
    db.commit()
    db.refresh(sector)
    return sector


@router.delete("/{id}", status_code=204)
def eliminar_sector(id: int, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    sector = db.query(Sector).filter(Sector.id == id).first()
    if not sector:
        raise HTTPException(status_code=404, detail="Sector no encontrado")
    sector.activo = False
    db.commit()
