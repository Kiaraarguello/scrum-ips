from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencias import obtener_db, obtener_usuario_actual, requerir_admin
from modelos.pc import PcRegistro
from modelos.alerta import AlertaAdmin
from modelos.usuario import Usuario
from esquemas.pc import PcCrear, PcActualizar, PcSalida

router = APIRouter(prefix="/pcs", tags=["pcs"])


@router.get("", response_model=list[PcSalida])
def listar_pcs(db: Session = Depends(obtener_db), _: Usuario = Depends(obtener_usuario_actual)):
    return db.query(PcRegistro).order_by(PcRegistro.fecha_ingreso.desc()).all()


@router.post("", response_model=PcSalida, status_code=201)
def crear_pc(datos: PcCrear, db: Session = Depends(obtener_db), usuario: Usuario = Depends(obtener_usuario_actual)):
    pc = PcRegistro(**datos.model_dump())
    db.add(pc)
    db.flush()
    alerta = AlertaAdmin(
        tipo="pc_ingresada",
        mensaje=f"PC '{pc.nombre_interno}' ingresada al taller por {usuario.nombre} {usuario.apellido}",
        pc_id=pc.id,
        usuario_id=usuario.id,
    )
    db.add(alerta)
    db.commit()
    db.refresh(pc)
    return pc


@router.put("/{id}", response_model=PcSalida)
def actualizar_pc(
    id: int, datos: PcActualizar, db: Session = Depends(obtener_db), _: Usuario = Depends(obtener_usuario_actual)
):
    pc = db.query(PcRegistro).filter(PcRegistro.id == id).first()
    if not pc:
        raise HTTPException(status_code=404, detail="PC no encontrada")
    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(pc, campo, valor)
    db.commit()
    db.refresh(pc)
    return pc


@router.delete("/{id}", status_code=204)
def eliminar_pc(id: int, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    pc = db.query(PcRegistro).filter(PcRegistro.id == id).first()
    if not pc:
        raise HTTPException(status_code=404, detail="PC no encontrada")
    db.delete(pc)
    db.commit()
