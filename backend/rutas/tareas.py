from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta, timezone
from dependencias import obtener_db, obtener_usuario_actual, requerir_admin
from modelos.tarea import Tarea
from modelos.historial import HistorialTarea
from modelos.alerta import AlertaAdmin
from modelos.usuario import Usuario
from esquemas.tarea import TareaCrear, TareaActualizar, TareaMover, TareaSalida

router = APIRouter(prefix="/tareas", tags=["tareas"])

LIMITE_FINALIZADAS_DIAS = 7


def _insertar_alerta(db: Session, tipo: str, mensaje: str, tarea_id: int | None = None, usuario_id: int | None = None):
    alerta = AlertaAdmin(tipo=tipo, mensaje=mensaje, tarea_id=tarea_id, usuario_id=usuario_id)
    db.add(alerta)


@router.get("", response_model=list[TareaSalida])
def listar_tareas(
    proyecto_id: int | None = None,
    db: Session = Depends(obtener_db), 
    usuario: Usuario = Depends(obtener_usuario_actual)
):
    corte = datetime.now(timezone.utc) - timedelta(days=LIMITE_FINALIZADAS_DIAS)
    query = db.query(Tarea).options(
        joinedload(Tarea.sector),
        joinedload(Tarea.sede),
        joinedload(Tarea.asignado)
    ).filter(
        Tarea.activo == True,
        (Tarea.estado != "finalizada") | (Tarea.fecha_finalizacion >= corte)
    )
    
    # Filtrado por proyecto
    if proyecto_id:
        query = query.filter(Tarea.proyecto_id == proyecto_id)
    else:
        query = query.filter(Tarea.proyecto_id.is_(None))

    return query.all()


@router.get("/{id}", response_model=TareaSalida)
def obtener_tarea(id: int, db: Session = Depends(obtener_db), _: Usuario = Depends(obtener_usuario_actual)):
    tarea = db.query(Tarea).filter(Tarea.id == id).first()
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return tarea


@router.post("", response_model=TareaSalida, status_code=201)
def crear_tarea(datos: TareaCrear, db: Session = Depends(obtener_db), usuario: Usuario = Depends(obtener_usuario_actual)):
    tarea = Tarea(**datos.model_dump(), creada_por=usuario.id)
    db.add(tarea)
    db.flush()
    mensaje = f"Nueva tarea '{tarea.titulo}' creada por {usuario.nombre} {usuario.apellido}"
    _insertar_alerta(db, "tarea_creada", mensaje, tarea_id=tarea.id, usuario_id=usuario.id)
    db.commit()
    db.refresh(tarea)
    return tarea


@router.put("/{id}", response_model=TareaSalida)
def actualizar_tarea(
    id: int, datos: TareaActualizar, db: Session = Depends(obtener_db), _: Usuario = Depends(obtener_usuario_actual)
):
    tarea = db.query(Tarea).filter(Tarea.id == id).first()
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    for campo, valor in datos.model_dump(exclude_none=True).items():
        setattr(tarea, campo, valor)
    db.commit()
    db.refresh(tarea)
    return tarea


@router.put("/{id}/mover", response_model=TareaSalida)
def mover_tarea(
    id: int, datos: TareaMover, db: Session = Depends(obtener_db), usuario: Usuario = Depends(obtener_usuario_actual)
):
    tarea = db.query(Tarea).filter(Tarea.id == id).first()
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")

    estado_anterior = tarea.estado
    tarea.estado = datos.nuevo_estado

    if datos.nuevo_estado == "en_proceso" and tarea.fecha_inicio is None:
        tarea.fecha_inicio = datetime.now(timezone.utc)
    if datos.nuevo_estado == "finalizada":
        tarea.fecha_finalizacion = datetime.now(timezone.utc)

    if datos.asignado_a is not None:
        tarea.asignado_a = datos.asignado_a

    historial = HistorialTarea(
        tarea_id=tarea.id,
        usuario_id=usuario.id,
        estado_anterior=estado_anterior,
        estado_nuevo=datos.nuevo_estado,
    )
    db.add(historial)

    mensaje = (
        f"Tarea '{tarea.titulo}' movida de '{estado_anterior}' a '{datos.nuevo_estado}' "
        f"por {usuario.nombre} {usuario.apellido}"
    )
    _insertar_alerta(db, "tarea_movida", mensaje, tarea_id=tarea.id, usuario_id=usuario.id)

    db.commit()
    db.refresh(tarea)
    return tarea


@router.delete("/{id}", status_code=204)
def eliminar_tarea(id: int, db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    tarea = db.query(Tarea).filter(Tarea.id == id).first()
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    tarea.activo = False
    db.commit()
