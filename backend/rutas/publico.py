from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from dependencias import obtener_db
from modelos.tarea import Tarea
from modelos.usuario import Usuario
from modelos.alerta import AlertaAdmin
from modelos.sector import Sector
from modelos.sede import Sede

router = APIRouter(prefix="/publico", tags=["publico"])


class SolicitudEntrada(BaseModel):
    titulo: str
    detalle: str | None = None
    criticidad: str = "baja"
    sede_id: int
    nombre_contacto: str | None = None
    telefono_contacto: str | None = None


@router.get("/sectores")
def sectores_publicos(db: Session = Depends(obtener_db)):
    return db.query(Sector).filter(Sector.activo == True).order_by(Sector.nombre).all()


@router.get("/sedes")
def sedes_publicas(db: Session = Depends(obtener_db)):
    return db.query(Sede).filter(Sede.activo == True).order_by(Sede.nombre).all()


@router.post("/solicitud", status_code=201)
def crear_solicitud(datos: SolicitudEntrada, db: Session = Depends(obtener_db)):
    admin = db.query(Usuario).filter(Usuario.rol == "admin", Usuario.activo == True).first()
    if not admin:
        raise HTTPException(status_code=503, detail="Sistema no disponible")

    sector = db.query(Sector).filter(Sector.activo == True).first()
    if not sector:
        raise HTTPException(status_code=503, detail="Sistema no disponible")

    # Armar nota con nombre de contacto al inicio si se proveyó
    partes = []
    if datos.nombre_contacto:
        partes.append(f"Contacto: {datos.nombre_contacto}")
    if datos.detalle:
        partes.append(datos.detalle)
    nota = "\n\n".join(partes) or None

    tarea = Tarea(
        titulo=datos.titulo,
        nota_llamada=nota,
        criticidad=datos.criticidad,
        sector_id=sector.id,
        sede_id=datos.sede_id,
        numero_contacto=datos.telefono_contacto,
        creada_por=admin.id,
    )
    db.add(tarea)
    db.flush()

    alerta = AlertaAdmin(
        tipo="tarea_creada",
        mensaje=f"Solicitud pública: '{tarea.titulo}'",
        tarea_id=tarea.id,
    )
    db.add(alerta)
    db.commit()
    return {"ok": True, "id": tarea.id}
