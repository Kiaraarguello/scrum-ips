from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from dependencias import obtener_db, requerir_admin
from modelos.proyecto import Proyecto as ProyectoModelo
from esquemas.proyecto import Proyecto, ProyectoCreate

router = APIRouter(prefix="/proyectos", tags=["proyectos"])

@router.get("/", response_model=List[Proyecto])
def listar_proyectos(db: Session = Depends(obtener_db)):
    return db.query(ProyectoModelo).filter(ProyectoModelo.activo == True).all()

from modelos.usuario import Usuario

@router.post("/", response_model=Proyecto, status_code=status.HTTP_201_CREATED)
def crear_proyecto(
    proyecto: ProyectoCreate, 
    db: Session = Depends(obtener_db),
    _admin = Depends(requerir_admin)
):
    datos = proyecto.model_dump(exclude={"usuarios_ids"})
    nuevo_proyecto = ProyectoModelo(**datos)
    
    if proyecto.usuarios_ids:
        usuarios = db.query(Usuario).filter(Usuario.id.in_(proyecto.usuarios_ids)).all()
        nuevo_proyecto.usuarios = usuarios
        
    db.add(nuevo_proyecto)
    db.commit()
    db.refresh(nuevo_proyecto)
    return nuevo_proyecto

@router.get("/{proyecto_id}", response_model=Proyecto)
def obtener_proyecto(proyecto_id: int, db: Session = Depends(obtener_db)):
    proyecto = db.query(ProyectoModelo).filter(ProyectoModelo.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto

@router.delete("/{proyecto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_proyecto(
    proyecto_id: int, 
    db: Session = Depends(obtener_db),
    _admin = Depends(requerir_admin)
):
    proyecto = db.query(ProyectoModelo).filter(ProyectoModelo.id == proyecto_id).first()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    proyecto.activo = False
    db.commit()
    return None
