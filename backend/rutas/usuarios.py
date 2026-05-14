from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencias import obtener_db, obtener_usuario_actual, requerir_admin
from modelos.usuario import Usuario
from modelos.sector import Sector
from esquemas.usuario import (
    UsuarioCrear, UsuarioActualizar, UsuarioSalidaConSector,
    ActualizarSectorPropio, ActualizarSectoresPropio, ActualizarPerfilPropio,
)
from seguridad import hashear_password

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


def _resolver_sectores(db: Session, sector_ids: list[int]) -> list[Sector]:
    sectores = db.query(Sector).filter(Sector.id.in_(sector_ids)).all()
    if len(sectores) != len(sector_ids):
        raise HTTPException(status_code=400, detail="Uno o más sectores no existen")
    return sectores


@router.get("", response_model=list[UsuarioSalidaConSector])
def listar_usuarios(db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    return db.query(Usuario).all()


@router.post("", response_model=UsuarioSalidaConSector, status_code=201)
def crear_usuario(datos: UsuarioCrear, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    if db.query(Usuario).filter(Usuario.email == datos.email).first():
        raise HTTPException(status_code=400, detail="El email ya esta registrado")
    usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        email=datos.email,
        password_hash=hashear_password(datos.password),
        rol=datos.rol,
    )
    if datos.sector_ids:
        usuario.sectores = _resolver_sectores(db, datos.sector_ids)
        usuario.sector_id = datos.sector_ids[0]
        usuario.seleccion_completada = True
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.get("/yo", response_model=UsuarioSalidaConSector)
def obtener_perfil_propio(
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(obtener_db),
):
    db.refresh(usuario_actual)
    return usuario_actual


@router.put("/yo", response_model=UsuarioSalidaConSector)
def actualizar_perfil_propio(
    datos: ActualizarPerfilPropio,
    db: Session = Depends(obtener_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    if datos.email and datos.email != usuario_actual.email:
        if db.query(Usuario).filter(Usuario.email == datos.email).first():
            raise HTTPException(status_code=400, detail="El email ya está en uso")
    for campo, valor in datos.model_dump(exclude_none=True).items():
        if campo == "password":
            setattr(usuario_actual, "password_hash", hashear_password(valor))
        else:
            setattr(usuario_actual, campo, valor)
    db.commit()
    db.refresh(usuario_actual)
    return usuario_actual


@router.put("/yo/sectores", response_model=UsuarioSalidaConSector)
def actualizar_sectores_propios(
    datos: ActualizarSectoresPropio,
    db: Session = Depends(obtener_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    usuario_actual.sectores = _resolver_sectores(db, datos.sector_ids) if datos.sector_ids else []
    usuario_actual.ver_todos = datos.ver_todos
    # Si el sector activo ya no está en la lista y no es "ver todos", limpiarlo
    if not datos.ver_todos and usuario_actual.sector_id and usuario_actual.sector_id not in datos.sector_ids:
        usuario_actual.sector_id = datos.sector_ids[0] if datos.sector_ids else None
    db.commit()
    db.refresh(usuario_actual)
    return usuario_actual


@router.put("/yo/sector", response_model=UsuarioSalidaConSector)
def actualizar_sector_activo(
    datos: ActualizarSectorPropio,
    db: Session = Depends(obtener_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    # Verificamos que los sectores existan
    sectores = _resolver_sectores(db, datos.sector_ids) if datos.sector_ids else []
    
    usuario_actual.sectores = sectores
    usuario_actual.ver_todos = datos.ver_todos
    usuario_actual.seleccion_completada = True
    
    # El sector_id (activo) será el primero de la lista o None
    usuario_actual.sector_id = datos.sector_ids[0] if datos.sector_ids else None
    
    db.commit()
    db.refresh(usuario_actual)
    return usuario_actual


@router.put("/{id}", response_model=UsuarioSalidaConSector)
def actualizar_usuario(
    id: int,
    datos: UsuarioActualizar,
    db: Session = Depends(obtener_db),
    _: Usuario = Depends(requerir_admin),
):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    campos = datos.model_dump(exclude_none=True)
    sector_ids = campos.pop("sector_ids", None)

    for campo, valor in campos.items():
        if campo == "password":
            setattr(usuario, "password_hash", hashear_password(valor))
        else:
            setattr(usuario, campo, valor)

    if sector_ids is not None:
        usuario.sectores = _resolver_sectores(db, sector_ids) if sector_ids else []
        if usuario.sector_id not in [s.id for s in usuario.sectores]:
            usuario.sector_id = sector_ids[0] if sector_ids else None
    
    if sector_ids or usuario.ver_todos:
        usuario.seleccion_completada = True

    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{id}", status_code=204)
def eliminar_usuario(id: int, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    usuario.activo = False
    db.commit()
